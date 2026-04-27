import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  readonly standardFormats = ['Article', 'Vidéo', 'PDF', 'Audio'];
  readonly adminOnlyFormats = ['Activité', 'Jeu'];
  form!: FormGroup;
  isSubmitting = false;
  isLoading = false;
  isEditMode = false;
  resourceId: number | null = null;
  errorMessage = '';
  isAdmin = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly ressourceService: RessourceService,
    private readonly categorieService: CategorieService,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    this.form = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required]],
      format: ['Article', [Validators.required, Validators.maxLength(100)]],
      visibilite: ['0', [Validators.required]],
      idCategorie: [null, [Validators.required]]
    });

    this.loadCategories();

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!Number.isNaN(id) && id > 0) {
      this.isEditMode = true;
      this.resourceId = id;
      this.loadResourceForEdit(id);
    }
  }

  private loadCategories(): void {
    this.categorieService.getCategories().subscribe({
      next: (categories) => { this.categories = categories; },
      error: () => { this.categories = []; }
    });
  }

  private loadResourceForEdit(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ressourceService.getRessourceForEdit(id).subscribe({
      next: (resource) => {
        this.form.patchValue({
          titre: resource.titre,
          description: resource.description,
          format: resource.format,
          visibilite: String(resource.visibilite),
          idCategorie: resource.idCategorie
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Impossible de charger la ressource à éditer.';
        this.isLoading = false;
      }
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

    const payload = {
      titre: value.titre,
      description: value.description,
      format: value.format,
      visibilite: Number(value.visibilite),
      idCategorie: Number(value.idCategorie)
    };

    const request$ = this.isEditMode && this.resourceId
      ? this.ressourceService.updateRessource(this.resourceId, payload)
      : this.ressourceService.createRessource(payload);

    request$.subscribe({
      next: () => {
        alert(this.isEditMode
          ? 'Votre ressource a bien été mise à jour et renvoyée en validation.'
          : 'Votre ressource a bien été soumise et sera validée par l’équipe.');
        this.router.navigate(['/ressources']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.statusText || `Erreur ${err?.status}` || 'Impossible de créer la ressource pour le moment.';
        this.isSubmitting = false;
      }
    });
  }

  get availableFormats(): string[] {
    return this.isAdmin
      ? [...this.standardFormats, ...this.adminOnlyFormats]
      : this.standardFormats;
  }
}
