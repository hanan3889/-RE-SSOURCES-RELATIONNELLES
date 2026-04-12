import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RessourceService, Ressource } from '../../services/ressource.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-ressource-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ressource-create.component.html',
  styleUrls: ['./ressource-create.component.scss']
})
export class RessourceCreateComponent implements OnInit {
  createForm: FormGroup;
  isSubmitting = false;
  categories: Category[] = [
    { id: 1, name: 'Santé Mentale' },
    { id: 2, name: 'Psychologie' },
    { id: 3, name: 'Sport & Bien-être' },
    { id: 4, name: 'Développement Personnel' },
    { id: 5, name: 'Communication' },
    { id: 6, name: 'Vie Professionnelle' },
    { id: 7, name: 'Management' },
    { id: 8, name: 'Compétences' },
  ];

  constructor(
    private fb: FormBuilder,
    private ressourceService: RessourceService,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      content: ['', Validators.required],
      categoryId: [1, Validators.required],
      visibilite: ['Publique', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      alert('Vous devez être connecté pour créer une ressource.');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Load categories from backend API
    this.http.get<any[]>(`${environment.apiUrl}/admin/categories`)
      .subscribe({
        next: (response) => {
          // API retourne des objets avec IdCategorie et NomCategorie
          this.categories = response.map(cat => ({ 
            id: cat.idCategorie || cat.IdCategorie, 
            name: cat.nomCategorie || cat.NomCategorie 
          }));
          
          if (this.categories.length > 0) {
            this.createForm.patchValue({ categoryId: this.categories[0].id });
          }
        },
        error: (err) => {
          console.error('Erreur chargement catégories:', err);
          // Keep hardcoded categories as fallback
        }
      });
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.createForm.value;

    // Map visibilite string to backend enum numeric values (0=Publique, 1=Connectes, 2=Privee)
    let visibiliteValue = 0;
    if (formValue.visibilite === 'Citoyens connectés') {
      visibiliteValue = 1;
    } else if (formValue.visibilite === 'Privée') {
      visibiliteValue = 2;
    }

    // Payload pour le backend - doit matcher CreateRessourceDto
    const backendPayload = {
      Titre: formValue.title,
      Description: formValue.description,
      Format: formValue.content,
      Visibilite: visibiliteValue,
      IdCategorie: formValue.categoryId
    };

    console.log('Payload envoyé:', backendPayload);
    console.log('Token présent:', !!localStorage.getItem('rr_access_token'));

    this.ressourceService.createRessource(backendPayload as Partial<Ressource>).subscribe({
      next: (ressource) => {
        this.isSubmitting = false;
        console.log('Ressource créée:', ressource);
        alert('Ressource créée avec succès ! ✅');
        this.router.navigate(['/ressources', ressource.idRessource ?? ressource.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Erreur création:', err);
        alert('Erreur lors de la création de la ressource: ' + (err?.error?.message || err?.message || 'Erreur inconnue'));
      }
    });
  }

  private getCategoryName(id: number): string {
    return this.categories.find(c => c.id === id)?.name ?? 'Divers';
  }
}

