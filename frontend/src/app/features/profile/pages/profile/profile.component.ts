import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { FavorisService, Ressource } from 'src/app/core/services/favoris.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  activeTab = 'identity';
  isEditingInfo = false;
  isChangingPassword = false;
  favoriteResources: any[] = [];
  stats = { resourcesViewed: 12, resourcesUsed: 5, resourcesPublished: 2, favoriteCount: 0, savedForLater: 3 };
  private favorisSub?: Subscription;

  infoForm!: FormGroup;
  passwordForm!: FormGroup;

  user = {
    firstName: '',
    lastName: '',
    email: '',
    avatar: '',
    role: '',
    registrationDate: new Date()
  };

  // Listes pour éviter les erreurs HTML
  exploitedResources: any[] = [];
  savedResources: any[] = [];
  publications: any[] = [];
  ongoingActivities: any[] = [];
  comments: any[] = [];
  invitations: any[] = [];

  constructor(private fb: FormBuilder, private authService: AuthService, private favorisService: FavorisService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.firstName = currentUser.prenom;
      this.user.lastName = currentUser.nom;
      this.user.email = currentUser.email;
      this.user.role = currentUser.role;
    }

    this.initForms();
    this.loadFavoriteData();

    this.favorisSub = this.favorisService.favorisChanged$.subscribe(() => {
      this.loadFavoriteData();
    });
  }

  initForms() {
    this.infoForm = this.fb.group({
      firstName: [this.user.firstName, Validators.required],
      lastName: [this.user.lastName, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email]],
      currentPasswordConfirm: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmNewPassword')?.value
      ? null : { mismatch: true };
  }

  private loadFavoriteData(): void {
    this.favorisService.getMesFavoris().subscribe({
      next: (favoris) => {
        this.favoriteResources = favoris;
        this.stats.favoriteCount = favoris.length;
      },
      error: () => {
        this.favoriteResources = [];
        this.stats.favoriteCount = 0;
      }
    });

    this.favorisService.getProgression().subscribe({
      next: (progression) => {
        this.stats.resourcesPublished = progression.nbPubliees;
        this.stats.resourcesViewed = progression.nbMesRessources; // approximation
        this.stats.favoriteCount = progression.nbFavoris;
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.favorisSub?.unsubscribe();
  }

  // --- FONCTIONS DE NAVIGATION ---
  selectTab(tab: string) { this.activeTab = tab; }
  formatDate(date: Date) { return new Date(date).toLocaleDateString(); }
  toggleEditInfo() { this.isEditingInfo = !this.isEditingInfo; }
  toggleChangePassword() { this.isChangingPassword = !this.isChangingPassword; }

  // --- ACTIONS DE COMPTE ---
  onSaveInfo() {
    if (this.infoForm.valid) {
      alert('Informations mises à jour avec succès !');
      this.isEditingInfo = false;
    }
  }

  onUpdatePassword() {
    if (this.passwordForm.valid) {
      alert('Mot de passe modifié !');
      this.isChangingPassword = false;
      this.passwordForm.reset();
    }
  }

  downloadData() { alert('Préparation de l\'export de vos données...'); }
  deleteAccount() { 
    if(confirm('Êtes-vous sûr de vouloir supprimer votre compte ?')) {
      alert('Compte supprimé.');
    }
  }

  // --- GESTION DES PUBLICATIONS & CONTENU ---
  createNewResource() { alert('Ouverture du formulaire de création...'); }
  
  getStatusBadge(status: string): string {
    const badges: any = {
      'published': 'Publié',
      'pending': 'En attente',
      'private': 'Privé'
    };
    return badges[status] || status;
  }

  retirerFavori(ressourceId: number): void {
    this.favorisService.retirerFavori(ressourceId).subscribe({
      next: () => {
        this.favoriteResources = this.favoriteResources.filter(res => {
          const resId = (res as any).idRessource ?? (res as any).id;
          return resId !== ressourceId;
        });
        this.stats.favoriteCount = Math.max(0, this.stats.favoriteCount - 1);
      },
      error: () => {
        alert('Impossible de retirer le favori pour le moment.');
      }
    });
  }

  getResourceId(resource: any): number {
    return resource.idRessource ?? resource.id ?? 0;
  }

  editPublication(id: any) { alert('Édition de la publication ' + id); }
  deletePublication(id: any) { alert('Suppression de la publication ' + id); }

  // --- INTERACTIONS SOCIALES ---
  resumeActivity(id: any) { alert('Reprise de l\'activité...'); }
  editComment(id: any) { alert('Modification du commentaire...'); }
  deleteComment(id: any) { alert('Commentaire supprimé.'); }
  respondToInvitation(id: any, accept: boolean) {
    alert(accept ? 'Invitation acceptée !' : 'Invitation refusée.');
  }
}