import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Role } from 'src/app/core/models/role.enum';
import { User } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { CreatePrivilegedUserDto, UserService } from 'src/app/core/services/user.service';
import { Categorie, CategorieService } from 'src/app/features/resources/services/categorie.service';
import { Ressource } from 'src/app/features/resources/services/ressource.service';
import { UserEditModalComponent } from '../../components/user-edit-modal/user-edit-modal.component';
import {
  AdminResourceFilters,
  AdminStatisticsFilters,
  AdminStatisticsResponse,
  ModerationComment,
  ModerationDashboardService
} from '../../services/moderation-dashboard.service';

type DashboardTab = 'resources' | 'queue' | 'comments' | 'categories' | 'users' | 'privileged' | 'stats';

interface PrivilegedRoleOption {
  id: number;
  label: string;
  value: Role;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, UserEditModalComponent, ReactiveFormsModule, FormsModule]
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  isEditModalOpen = false;
  activeTab: DashboardTab = 'resources';

  categories: Categorie[] = [];
  adminResources: Ressource[] = [];
  moderationQueue: Ressource[] = [];
  moderationComments: ModerationComment[] = [];
  statistics: AdminStatisticsResponse | null = null;

  resourceFilters: AdminResourceFilters = {
    statut: '',
    categorie: '',
    format: '',
    visibilite: '',
    auteur: '',
    recherche: ''
  };

  statisticsFilters: AdminStatisticsFilters = {
    dateDebut: '',
    dateFin: '',
    categorie: '',
    format: '',
    visibilite: ''
  };

  categoryDraft = '';
  editingCategoryId: number | null = null;

  privilegedUserDraft: CreatePrivilegedUserDto = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    idRole: 2
  };

  isLoadingUsers = false;
  isLoadingResources = false;
  isLoadingQueue = false;
  isLoadingComments = false;
  isSavingCategory = false;
  isCreatingPrivilegedUser = false;
  isLoadingStatistics = false;

  resourceError = '';
  queueError = '';
  commentsError = '';
  userError = '';
  categoryError = '';
  categorySuccess = '';
  privilegedUserError = '';
  privilegedUserSuccess = '';
  statisticsError = '';

  readonly statusOptions = ['Brouillon', 'EnValidation', 'Publiee', 'Rejetee', 'Archivee'];
  readonly visibilityOptions = ['Publique', 'Connectes', 'Privee'];
  readonly formatOptions = ['Article', 'Vidéo', 'PDF', 'Audio', 'Activité', 'Jeu'];
  readonly privilegedRoleOptions: PrivilegedRoleOption[] = [
    { id: 2, label: 'Modérateur', value: Role.MODERATEUR },
    { id: 3, label: 'Administrateur', value: Role.ADMINISTRATEUR },
    { id: 4, label: 'Super-administrateur', value: Role.SUPER_ADMINISTRATEUR }
  ];

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly categorieService: CategorieService,
    private readonly moderationDashboardService: ModerationDashboardService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadAdminResources();
    this.loadModerationQueue();
    this.loadModerationComments();

    if (this.canManageUsers) {
      this.loadUsers();
    }

    if (this.canSeeStatistics) {
      this.loadStatistics();
    }

    this.activeTab = this.canManageAdminResources ? 'resources' : 'queue';
  }

  loadUsers(): void {
    if (!this.canManageUsers) {
      this.users = [];
      return;
    }

    this.isLoadingUsers = true;
    this.userError = '';

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoadingUsers = false;
      },
      error: (err: any) => {
        console.error('Error loading users', err);
        this.userError = 'Impossible de charger les utilisateurs.';
        this.isLoadingUsers = false;
      }
    });
  }

  loadCategories(): void {
    this.categorieService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  loadAdminResources(): void {
    this.isLoadingResources = true;
    this.resourceError = '';

    this.moderationDashboardService.getAdminResources(this.resourceFilters).subscribe({
      next: (resources) => {
        this.adminResources = resources;
        this.isLoadingResources = false;
      },
      error: () => {
        this.adminResources = [];
        this.resourceError = 'Impossible de charger les ressources du back office.';
        this.isLoadingResources = false;
      }
    });
  }

  loadModerationQueue(): void {
    this.isLoadingQueue = true;
    this.queueError = '';

    this.moderationDashboardService.getModerationQueue().subscribe({
      next: (resources) => {
        this.moderationQueue = resources;
        this.isLoadingQueue = false;
      },
      error: () => {
        this.moderationQueue = [];
        this.queueError = 'Impossible de charger la file de validation.';
        this.isLoadingQueue = false;
      }
    });
  }

  loadModerationComments(): void {
    this.isLoadingComments = true;
    this.commentsError = '';

    this.moderationDashboardService.getModerationComments().subscribe({
      next: (comments) => {
        this.moderationComments = comments;
        this.isLoadingComments = false;
      },
      error: () => {
        this.moderationComments = [];
        this.commentsError = 'Impossible de charger les commentaires à modérer.';
        this.isLoadingComments = false;
      }
    });
  }

  loadStatistics(): void {
    if (!this.canSeeStatistics) {
      this.statistics = null;
      return;
    }

    this.isLoadingStatistics = true;
    this.statisticsError = '';

    this.moderationDashboardService.getStatistics(this.statisticsFilters).subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.isLoadingStatistics = false;
      },
      error: () => {
        this.statistics = null;
        this.statisticsError = 'Impossible de charger les statistiques administrateur.';
        this.isLoadingStatistics = false;
      }
    });
  }

  exportStatistics(): void {
    this.moderationDashboardService.exportStatistics(this.statisticsFilters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'statistiques-admin.csv';
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.statisticsError = 'Impossible d’exporter les statistiques.';
      }
    });
  }

  setActiveTab(tab: DashboardTab): void {
    this.activeTab = tab;
  }

  resetResourceFilters(): void {
    this.resourceFilters = {
      statut: '',
      categorie: '',
      format: '',
      visibilite: '',
      auteur: '',
      recherche: ''
    };
    this.loadAdminResources();
  }

  resetStatisticsFilters(): void {
    this.statisticsFilters = {
      dateDebut: '',
      dateFin: '',
      categorie: '',
      format: '',
      visibilite: ''
    };
    this.loadStatistics();
  }

  editResource(resourceId: number): void {
    this.router.navigate(['/ressources', resourceId, 'editer']);
  }

  suspendResource(resourceId: number): void {
    this.moderationDashboardService.suspendResource(resourceId).subscribe({
      next: () => {
        this.loadAdminResources();
      },
      error: () => {
        this.resourceError = 'Impossible de suspendre cette ressource.';
      }
    });
  }

  deleteResource(resourceId: number): void {
    this.moderationDashboardService.deleteResource(resourceId).subscribe({
      next: () => {
        this.adminResources = this.adminResources.filter(resource => resource.id !== resourceId);
        this.moderationQueue = this.moderationQueue.filter(resource => resource.id !== resourceId);
      },
      error: () => {
        this.resourceError = 'Impossible de supprimer cette ressource.';
      }
    });
  }

  approveResource(resourceId: number): void {
    this.moderationDashboardService.approveResource(resourceId).subscribe({
      next: () => {
        this.moderationQueue = this.moderationQueue.filter(resource => resource.id !== resourceId);
        this.loadAdminResources();
      },
      error: () => {
        this.queueError = 'Impossible de valider cette ressource.';
      }
    });
  }

  rejectResource(resourceId: number): void {
    this.moderationDashboardService.rejectResource(resourceId).subscribe({
      next: () => {
        this.moderationQueue = this.moderationQueue.filter(resource => resource.id !== resourceId);
        this.loadAdminResources();
      },
      error: () => {
        this.queueError = 'Impossible de refuser cette ressource.';
      }
    });
  }

  deleteComment(commentId: number): void {
    this.moderationDashboardService.deleteModerationComment(commentId).subscribe({
      next: () => {
        this.moderationComments = this.moderationComments.filter(comment => comment.idCommentaire !== commentId);
      },
      error: () => {
        this.commentsError = 'Impossible de supprimer ce commentaire.';
      }
    });
  }

  startCategoryEdit(category: Categorie): void {
    this.editingCategoryId = category.idCategorie;
    this.categoryDraft = category.nomCategorie;
    this.categoryError = '';
    this.categorySuccess = '';
  }

  resetCategoryForm(): void {
    this.editingCategoryId = null;
    this.categoryDraft = '';
    this.categoryError = '';
    this.categorySuccess = '';
  }

  saveCategory(): void {
    const nomCategorie = this.categoryDraft.trim();
    if (!nomCategorie) {
      this.categoryError = 'Le nom de la catégorie est requis.';
      return;
    }

    this.isSavingCategory = true;
    this.categoryError = '';
    this.categorySuccess = '';

    const request$ = this.editingCategoryId
      ? this.categorieService.updateCategory(this.editingCategoryId, { nomCategorie })
      : this.categorieService.createCategory({ nomCategorie });

    request$.subscribe({
      next: () => {
        const successMessage = this.editingCategoryId
          ? 'Catégorie mise à jour.'
          : 'Catégorie créée.';
        this.resetCategoryForm();
        this.categorySuccess = successMessage;
        this.loadCategories();
        this.isSavingCategory = false;
      },
      error: () => {
        this.categoryError = 'Impossible d’enregistrer cette catégorie.';
        this.isSavingCategory = false;
      }
    });
  }

  deleteCategory(categoryId: number): void {
    this.categorieService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.categories = this.categories.filter(category => category.idCategorie !== categoryId);
        if (this.editingCategoryId === categoryId) {
          this.resetCategoryForm();
        }
      },
      error: () => {
        this.categoryError = 'Impossible de supprimer cette catégorie.';
      }
    });
  }

  createPrivilegedUser(): void {
    this.privilegedUserError = '';
    this.privilegedUserSuccess = '';

    if (!this.privilegedUserDraft.nom.trim() || !this.privilegedUserDraft.prenom.trim() || !this.privilegedUserDraft.email.trim() || !this.privilegedUserDraft.password.trim()) {
      this.privilegedUserError = 'Tous les champs sont requis pour créer un compte privilégié.';
      return;
    }

    this.isCreatingPrivilegedUser = true;

    this.userService.createPrivilegedUser({
      nom: this.privilegedUserDraft.nom.trim(),
      prenom: this.privilegedUserDraft.prenom.trim(),
      email: this.privilegedUserDraft.email.trim(),
      password: this.privilegedUserDraft.password,
      idRole: Number(this.privilegedUserDraft.idRole)
    }).subscribe({
      next: () => {
        this.privilegedUserSuccess = 'Compte privilégié créé.';
        this.privilegedUserDraft = {
          nom: '',
          prenom: '',
          email: '',
          password: '',
          idRole: 2
        };
        this.isCreatingPrivilegedUser = false;
        if (this.canManageUsers) {
          this.loadUsers();
        }
      },
      error: (err) => {
        this.privilegedUserError = err?.error?.message || 'Impossible de créer ce compte privilégié.';
        this.isCreatingPrivilegedUser = false;
      }
    });
  }

  get canManageUsers(): boolean {
    return this.authService.isAdmin();
  }

  get canManageAdminResources(): boolean {
    return this.authService.isAdmin();
  }

  get canManageCategories(): boolean {
    return this.authService.isAdmin();
  }

  get canCreatePrivilegedAccounts(): boolean {
    return this.authService.hasRole('super_administrateur');
  }

  get canSeeStatistics(): boolean {
    return this.authService.isAdmin();
  }

  get currentRoleLabel(): string {
    const role = this.authService.getRole();

    switch (role) {
      case 'moderateur':
        return 'Modérateur';
      case 'super_administrateur':
        return 'Super-administrateur';
      case 'administrateur':
        return 'Administrateur';
      default:
        return 'Utilisateur';
    }
  }

  onEditUser(user: User): void {
    this.selectedUser = user;
    this.isEditModalOpen = true;
  }

  onCloseEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedUser = null;
  }

  onUserUpdated(updatedUser: User): void {
    const index = this.users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = updatedUser;
    }
    this.onCloseEditModal();
    this.loadUsers();
  }

  onResetPassword(user: User): void {
    if (confirm(`Are you sure you want to reset the password for ${user.email}?`)) {
      const newDummyPassword = 'NewSecurePassword123!';
      this.userService.resetUserPassword(user.id, newDummyPassword).subscribe({
        next: () => {
          alert(`Password for ${user.email} has been reset.`);
        },
        error: (err: any) => {
          console.error('Error resetting password', err);
          alert('Failed to reset password.');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  onDeleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete the user ${user.email}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          alert(`User ${user.email} deleted successfully.`);
          this.loadUsers();
        },
        error: (err: any) => {
          console.error('Error deleting user', err);
          alert('Failed to delete user.');
        }
      });
    }
  }
}

