import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/user.model';
import { UserEditModalComponent } from '../../components/user-edit-modal/user-edit-modal.component'; // Import the new modal component
import { CommonModule } from '@angular/common'; // Needed for ngIf, ngFor
import { ReactiveFormsModule } from '@angular/forms'; // Needed for the modal's form
import { AuthService } from 'src/app/core/services/auth.service';
import { FormsModule } from '@angular/forms';
import {
  AdminCreateRessourcePayload,
  AdminRessource,
  AdminUpdateRessourcePayload,
  VisibiliteOption
} from 'src/app/core/models/admin-ressource.model';
import { AdminCategorie } from 'src/app/core/models/admin-categorie.model';
import { AdminRessourceService } from 'src/app/core/services/admin-ressource.service';
import { AdminCategorieService } from 'src/app/core/services/admin-categorie.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true, // Assuming DashboardComponent is standalone
  imports: [CommonModule, UserEditModalComponent, ReactiveFormsModule, FormsModule] // Add UserEditModalComponent to imports
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  ressources: AdminRessource[] = [];
  categories: AdminCategorie[] = [];

  selectedUser: User | null = null;
  isEditModalOpen: boolean = false; // Control modal visibility

  isLoadingUsers = false;
  isLoadingRessources = false;
  isLoadingCategories = false;

  ressourcesError = '';
  categoriesError = '';

  readonly statuts = ['Brouillon', 'EnValidation', 'Publiee', 'Rejetee', 'Archivee'];
  selectedStatutFilter = '';

  readonly visibiliteOptions: VisibiliteOption[] = [
    { value: 0, label: 'Publique' },
    { value: 1, label: 'Connectés' },
    { value: 2, label: 'Privée' }
  ];

  newRessource: AdminCreateRessourcePayload = {
    titre: '',
    description: '',
    format: '',
    visibilite: 0,
    idCategorie: 0
  };

  editingRessourceId: number | null = null;
  editingRessource: AdminUpdateRessourcePayload = {};

  newCategorieName = '';
  editingCategorieId: number | null = null;
  editingCategorieName = '';

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly adminRessourceService: AdminRessourceService,
    private readonly adminCategorieService: AdminCategorieService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadCategories();
    this.loadRessources();
  }

  loadUsers(): void {
    this.isLoadingUsers = true;

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoadingUsers = false;
      },
      error: (err: any) => {
        console.error('Error loading users', err);
        this.isLoadingUsers = false;
        // Handle error (e.g., show a message to the user)
      }
    });
  }

  loadRessources(): void {
    this.isLoadingRessources = true;
    this.ressourcesError = '';

    const statutFilter = this.selectedStatutFilter.trim();
    const statut = statutFilter.length > 0 ? statutFilter : undefined;

    this.adminRessourceService.getAll(statut).subscribe({
      next: (data) => {
        this.ressources = data;
        this.isLoadingRessources = false;
      },
      error: (err: unknown) => {
        console.error('Error loading ressources', err);
        this.ressourcesError = 'Impossible de charger les ressources.';
        this.isLoadingRessources = false;
      }
    });
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoriesError = '';

    this.adminCategorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoadingCategories = false;

        if (this.newRessource.idCategorie === 0 && data.length > 0) {
          this.newRessource.idCategorie = data[0].idCategorie;
        }
      },
      error: (err: unknown) => {
        console.error('Error loading categories', err);
        this.categoriesError = 'Impossible de charger les catégories.';
        this.isLoadingCategories = false;
      }
    });
  }

  onEditUser(user: User): void {
    this.selectedUser = user;
    this.isEditModalOpen = true; // Open the modal
  }

  onCloseEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedUser = null; // Clear selected user when modal closes
  }

  onUserUpdated(updatedUser: User): void {
    // Find the updated user in the list and replace it
    const index = this.users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = updatedUser;
    }
    this.onCloseEditModal(); // Close modal after update
    this.loadUsers(); // Refresh the user list to ensure data consistency
  }

  onResetPassword(user: User): void {
    if (confirm(`Are you sure you want to reset the password for ${user.email}?`)) {
      // For now, we'll use a dummy password. In a real app, you'd have a secure way to set/generate it.
      const newDummyPassword = 'NewSecurePassword123!'; // This should be handled securely by the backend
      this.userService.resetUserPassword(user.id, newDummyPassword).subscribe({
        next: () => {
          alert(`Password for ${user.email} has been reset.`);
        },
        error: (err: any) => { // Explicitly type err
          console.error('Error resetting password', err);
          alert('Failed to reset password.');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  applyRessourceFilter(): void {
    this.loadRessources();
  }

  createRessource(): void {
    if (!this.newRessource.titre.trim() || !this.newRessource.description.trim() || !this.newRessource.format.trim() || this.newRessource.idCategorie <= 0) {
      alert('Merci de remplir tous les champs obligatoires pour la ressource.');
      return;
    }

    this.adminRessourceService.create(this.newRessource).subscribe({
      next: () => {
        this.newRessource = {
          titre: '',
          description: '',
          format: '',
          visibilite: 0,
          idCategorie: this.categories.length > 0 ? this.categories[0].idCategorie : 0
        };
        this.loadRessources();
      },
      error: (err: unknown) => {
        console.error('Error creating ressource', err);
        alert('Création impossible. Vérifiez les champs saisis.');
      }
    });
  }

  startEditRessource(ressource: AdminRessource): void {
    this.editingRessourceId = ressource.idRessource;
    this.editingRessource = {
      titre: ressource.titre,
      description: ressource.description,
      format: ressource.format,
      visibilite: this.mapVisibiliteLabelToValue(ressource.visibilite),
      idCategorie: ressource.idCategorie
    };
  }

  cancelEditRessource(): void {
    this.editingRessourceId = null;
    this.editingRessource = {};
  }

  saveRessource(ressourceId: number): void {
    this.adminRessourceService.update(ressourceId, this.editingRessource).subscribe({
      next: () => {
        this.cancelEditRessource();
        this.loadRessources();
      },
      error: (err: unknown) => {
        console.error('Error updating ressource', err);
        alert('Modification impossible pour cette ressource.');
      }
    });
  }

  deleteRessource(ressource: AdminRessource): void {
    if (!confirm(`Supprimer la ressource "${ressource.titre}" ?`)) {
      return;
    }

    this.adminRessourceService.delete(ressource.idRessource).subscribe({
      next: () => {
        this.loadRessources();
      },
      error: (err: unknown) => {
        console.error('Error deleting ressource', err);
        alert('Suppression impossible pour cette ressource.');
      }
    });
  }

  createCategorie(): void {
    const nomCategorie = this.newCategorieName.trim();
    if (!nomCategorie) {
      alert('Le nom de la catégorie est obligatoire.');
      return;
    }

    this.adminCategorieService.create({ nomCategorie }).subscribe({
      next: () => {
        this.newCategorieName = '';
        this.loadCategories();
      },
      error: (err: unknown) => {
        console.error('Error creating categorie', err);
        alert('Création de la catégorie impossible.');
      }
    });
  }

  startEditCategorie(categorie: AdminCategorie): void {
    this.editingCategorieId = categorie.idCategorie;
    this.editingCategorieName = categorie.nomCategorie;
  }

  cancelEditCategorie(): void {
    this.editingCategorieId = null;
    this.editingCategorieName = '';
  }

  saveCategorie(categorieId: number): void {
    const nomCategorie = this.editingCategorieName.trim();
    if (!nomCategorie) {
      alert('Le nom de la catégorie est obligatoire.');
      return;
    }

    this.adminCategorieService.update(categorieId, { nomCategorie }).subscribe({
      next: () => {
        this.cancelEditCategorie();
        this.loadCategories();
      },
      error: (err: unknown) => {
        console.error('Error updating categorie', err);
        alert('Modification de la catégorie impossible.');
      }
    });
  }

  deleteCategorie(categorie: AdminCategorie): void {
    if (!confirm(`Supprimer la catégorie "${categorie.nomCategorie}" ?`)) {
      return;
    }

    this.adminCategorieService.delete(categorie.idCategorie).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (err: unknown) => {
        console.error('Error deleting categorie', err);
        alert('Suppression impossible. Cette catégorie est peut-être utilisée par des ressources.');
      }
    });
  }

  getRessourceCountByStatut(statut: string): number {
    return this.ressources.filter((ressource) => ressource.statut.toLowerCase() === statut.toLowerCase()).length;
  }

  getAuteurFullName(ressource: AdminRessource): string {
    return `${ressource.prenomAuteur} ${ressource.nomAuteur}`.trim();
  }

  private mapVisibiliteLabelToValue(label: string): number {
    const normalized = label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (normalized.includes('connect')) {
      return 1;
    }

    if (normalized.includes('prive')) {
      return 2;
    }

    return 0;
  }

  onDeleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete the user ${user.email}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          alert(`User ${user.email} deleted successfully.`);
          this.loadUsers(); // Refresh the user list
        },
        error: (err: any) => { // Explicitly type err
          console.error('Error deleting user', err);
          alert('Failed to delete user.');
        }
      });
    }
  }
}

