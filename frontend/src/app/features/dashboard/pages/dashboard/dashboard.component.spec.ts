import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { CategorieService, Categorie } from 'src/app/features/resources/services/categorie.service';
import {
  ModerationDashboardService,
} from '../../services/moderation-dashboard.service';
import { Ressource } from 'src/app/features/resources/services/ressource.service';
import { User } from 'src/app/core/models/user.model';
import { Router } from '@angular/router';

const mockRessource: Ressource = {
  id: 1,
  title: 'Guide test',
  description: 'Desc',
  content: 'Contenu',
  author: 'Alice Dupont',
  category: 'Couple',
  createdAt: new Date(),
  format: 'Article',
  type: 'article',
  visibilite: 'Publique',
  statut: 'En validation',
};

const mockUser: User = {
  id: 1,
  email: 'alice@example.com',
  nom: 'Dupont',
  prenom: 'Alice',
  role: 'citoyen',
  isActive: true,
} as any;

const mockCategorie: Categorie = { idCategorie: 1, nomCategorie: 'Couple' };

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let userSpy: jasmine.SpyObj<UserService>;
  let categorieSpy: jasmine.SpyObj<CategorieService>;
  let moderationSpy: jasmine.SpyObj<ModerationDashboardService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['isAdmin', 'hasRole', 'getRole', 'logout']);
    authSpy.isAdmin.and.returnValue(true);
    authSpy.hasRole.and.returnValue(false);
    authSpy.getRole.and.returnValue('administrateur');

    userSpy = jasmine.createSpyObj('UserService', ['getAllUsers', 'deleteUser', 'resetUserPassword', 'createPrivilegedUser']);
    userSpy.getAllUsers.and.returnValue(of([mockUser]));

    categorieSpy = jasmine.createSpyObj('CategorieService', ['getCategories', 'createCategory', 'updateCategory', 'deleteCategory']);
    categorieSpy.getCategories.and.returnValue(of([mockCategorie]));

    moderationSpy = jasmine.createSpyObj('ModerationDashboardService', [
      'getAdminResources', 'getModerationQueue', 'getModerationComments',
      'getStatistics', 'approveResource', 'rejectResource',
      'deleteResource', 'suspendResource', 'deleteModerationComment',
      'exportStatistics',
    ]);
    moderationSpy.getAdminResources.and.returnValue(of([]));
    moderationSpy.getModerationQueue.and.returnValue(of([mockRessource]));
    moderationSpy.getModerationComments.and.returnValue(of([]));
    moderationSpy.getStatistics.and.returnValue(of({
      resume: {
        totalRessources: 10, ressourcesPubliees: 5, ressourcesEnValidation: 2,
        ressourcesArchivees: 0, totalUtilisateurs: 20, utilisateursActifs: 18,
        comptesCreesPeriode: 3, favoris: 15, commentaires: 8, exploitations: 0,
        sauvegardes: 0, activitesDemarrees: 0, invitationsEnvoyees: 0,
        invitationsAcceptees: 0, messagesDiscussion: 0
      },
      creationsParCategorie: [],
      creationsParFormat: [],
      repartitionVisibilite: [],
      filtres: {}
    }));

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: CategorieService, useValue: categorieSpy },
        { provide: ModerationDashboardService, useValue: moderationSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('canManageUsers doit etre true pour un admin', () => {
    expect(component.canManageUsers).toBeTrue();
  });

  it('canManageUsers doit etre false pour un moderateur', () => {
    authSpy.isAdmin.and.returnValue(false);
    expect(component.canManageUsers).toBeFalse();
  });

  it('canCreatePrivilegedAccounts doit etre true pour un super_administrateur', () => {
    authSpy.hasRole.and.returnValue(true);
    expect(component.canCreatePrivilegedAccounts).toBeTrue();
  });

  it('currentRoleLabel doit retourner "Administrateur" pour le role administrateur', () => {
    authSpy.getRole.and.returnValue('administrateur');
    expect(component.currentRoleLabel).toBe('Administrateur');
  });

  it('currentRoleLabel doit retourner "Modérateur" pour le role moderateur', () => {
    authSpy.getRole.and.returnValue('moderateur');
    expect(component.currentRoleLabel).toBe('Modérateur');
  });

  // CT-MOD-001 — File de modération chargée
  it('loadModerationQueue() doit remplir moderationQueue', fakeAsync(() => {
    component.loadModerationQueue();
    tick();
    expect(component.moderationQueue.length).toBe(1);
    expect(component.moderationQueue[0].title).toBe('Guide test');
  }));

  // CT-MOD-002 — Valider une ressource
  it('approveResource() doit filtrer la ressource de la file', fakeAsync(() => {
    component.moderationQueue = [mockRessource];
    moderationSpy.approveResource.and.returnValue(of(undefined));
    moderationSpy.getAdminResources.and.returnValue(of([]));

    component.approveResource(1);
    tick();

    expect(moderationSpy.approveResource).toHaveBeenCalledWith(1);
    expect(component.moderationQueue.length).toBe(0);
  }));

  // CT-MOD-003 — Refuser une ressource
  it('rejectResource() doit filtrer la ressource de la file', fakeAsync(() => {
    component.moderationQueue = [mockRessource];
    moderationSpy.rejectResource.and.returnValue(of(undefined));
    moderationSpy.getAdminResources.and.returnValue(of([]));

    component.rejectResource(1);
    tick();

    expect(moderationSpy.rejectResource).toHaveBeenCalledWith(1);
    expect(component.moderationQueue.length).toBe(0);
  }));

  it('setActiveTab() doit changer l onglet actif', () => {
    component.setActiveTab('users');
    expect(component.activeTab).toBe('users');

    component.setActiveTab('queue');
    expect(component.activeTab).toBe('queue');
  });

  it('loadUsers() doit charger les utilisateurs', fakeAsync(() => {
    component.loadUsers();
    tick();
    expect(component.users.length).toBe(1);
    expect(component.users[0].email).toBe('alice@example.com');
  }));

  it('loadCategories() doit charger les categories', fakeAsync(() => {
    component.loadCategories();
    tick();
    expect(component.categories.length).toBe(1);
  }));

  it('loadModerationQueue() doit afficher une erreur si l API echoue', fakeAsync(() => {
    moderationSpy.getModerationQueue.and.returnValue(throwError(() => new Error('Network error')));
    component.loadModerationQueue();
    tick();
    expect(component.queueError).toBeTruthy();
    expect(component.moderationQueue).toEqual([]);
  }));

  it('logout() doit appeler authService.logout()', () => {
    component.logout();
    expect(authSpy.logout).toHaveBeenCalled();
  });

  it('onEditUser() doit ouvrir le modal avec l utilisateur selectionne', () => {
    component.onEditUser(mockUser);
    expect(component.selectedUser).toBe(mockUser);
    expect(component.isEditModalOpen).toBeTrue();
  });

  it('onCloseEditModal() doit fermer le modal', () => {
    component.isEditModalOpen = true;
    component.selectedUser = mockUser;
    component.onCloseEditModal();
    expect(component.isEditModalOpen).toBeFalse();
    expect(component.selectedUser).toBeNull();
  });
});
