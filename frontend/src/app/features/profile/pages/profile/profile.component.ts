import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  activeTab = 'identity';
  isEditingInfo = false;
  isChangingPassword = false;

  infoForm!: FormGroup;
  passwordForm!: FormGroup;

  user = {
    firstName: '',
    lastName: '',
    email: '',
    avatar: '👤',
    role: '',
    registrationDate: new Date()
  };

  // Listes pour éviter les erreurs HTML
  exploitedResources: any[] = [];
  savedResources: any[] = [];
  favoriteResources: any[] = [];
  publications: any[] = [];
  ongoingActivities: any[] = [];
  comments: any[] = [];
  invitations: any[] = [];
  stats = { resourcesViewed: 12, resourcesUsed: 5, resourcesPublished: 2, favoriteCount: 8, savedForLater: 3 };

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.firstName = currentUser.prenom;
      this.user.lastName = currentUser.nom;
      this.user.email = currentUser.email;
      this.user.role = currentUser.role;
    }
    this.initForms();
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