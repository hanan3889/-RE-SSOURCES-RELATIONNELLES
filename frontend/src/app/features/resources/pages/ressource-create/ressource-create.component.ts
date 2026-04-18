import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RessourceService } from '../../services/ressource.service';
import { CategorieService, Categorie } from '../../services/categorie.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-ressource-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ressource-create.component.html',
  styleUrls: ['./ressource-create.component.scss']
})
export class RessourceCreateComponent implements OnInit {
  categories: Categorie[] = [];
  form!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly ressourceService: RessourceService,
    private readonly categorieService: CategorieService,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required]],
      format: ['', [Validators.required, Validators.maxLength(100)]],
      visibilite: ['0', [Validators.required]],
      idCategorie: [null, [Validators.required]]
    });

    this.loadCategories();
  }

  private loadCategories(): void {
    this.categorieService.getCategories().subscribe({
      next: (categories) => { this.categories = categories; },
      error: () => { this.categories = []; }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const value = this.form.value;
    const token = this.authService.getToken();
    console.log('RessourceCreate token:', token);

    if (!token) {
      this.errorMessage = 'Vous devez être connecté pour créer une ressource.';
      this.isSubmitting = false;
      this.router.navigate(['/auth/login']);
      return;
    }

    this.ressourceService.createRessource({
      titre: value.titre,
      description: value.description,
      format: value.format,
      visibilite: Number(value.visibilite),
      idCategorie: Number(value.idCategorie)
    }).subscribe({
      next: () => {
        alert('Votre ressource a bien été soumise et sera validée par l’équipe.');
        this.router.navigate(['/ressources']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.statusText || `Erreur ${err?.status}` || 'Impossible de créer la ressource pour le moment.';
        this.isSubmitting = false;
      }
    });
  }
}
