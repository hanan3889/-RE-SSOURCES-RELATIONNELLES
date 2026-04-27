import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { RessourceListComponent } from './ressource-list.component';
import { RessourceService, Ressource } from '../../services/ressource.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategorieService } from '../../services/categorie.service';

const mockRessources: Ressource[] = [
  {
    id: 1,
    title: 'Guide communication couple',
    description: 'Apprendre a communiquer',
    content: 'Contenu',
    author: 'Alice Dupont',
    category: 'Couple',
    createdAt: new Date('2026-01-01'),
    format: 'Article',
    type: 'article',
    visibilite: 'Publique',
    statut: 'Publiée',
  },
  {
    id: 2,
    title: 'Gestion conflits familiaux',
    description: 'Resoudre les conflits',
    content: 'Contenu 2',
    author: 'Bob Martin',
    category: 'Famille',
    createdAt: new Date('2026-02-01'),
    format: 'Vidéo',
    type: 'article',
    visibilite: 'Publique',
    statut: 'Publiée',
  },
];

describe('RessourceListComponent', () => {
  let component: RessourceListComponent;
  let fixture: ComponentFixture<RessourceListComponent>;
  let ressourceServiceSpy: jasmine.SpyObj<RessourceService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let categorieServiceSpy: jasmine.SpyObj<CategorieService>;

  beforeEach(async () => {
    ressourceServiceSpy = jasmine.createSpyObj('RessourceService', ['getRessources', 'getRestrictedRessources']);
    ressourceServiceSpy.getRessources.and.returnValue(of(mockRessources));
    ressourceServiceSpy.getRestrictedRessources.and.returnValue(of([]));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    authServiceSpy.isLoggedIn.and.returnValue(false);

    categorieServiceSpy = jasmine.createSpyObj('CategorieService', ['getCategories']);
    categorieServiceSpy.getCategories.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [RessourceListComponent, RouterTestingModule],
      providers: [
        { provide: RessourceService, useValue: ressourceServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CategorieService, useValue: categorieServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RessourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // CT-RES-001 — Lister les ressources publiques
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('devrait appeler getRessources au demarrage', () => {
    expect(ressourceServiceSpy.getRessources).toHaveBeenCalled();
  });

  it('devrait stocker les ressources chargees dans le tableau ressources', () => {
    expect(component.ressources.length).toBe(2);
    expect(component.ressources[0].title).toBe('Guide communication couple');
  });

  it('devrait avoir la date courante comme currentYear', () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('isLoggedIn devrait etre false si authService retourne false', () => {
    expect(component.isLoggedIn).toBeFalse();
  });

  it('devrait vider les ressources et afficher un message en cas d erreur reseau', () => {
    ressourceServiceSpy.getRessources.and.returnValue(throwError(() => new Error('Network error')));
    component['loadRessources']();
    fixture.detectChanges();
    expect(component.ressources).toEqual([]);
    expect(component.errorMessage).toBeTruthy();
  });

  it('devrait afficher les ressources pour un utilisateur connecte', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    component.ngOnInit();
    expect(component.isLoggedIn).toBeTrue();
  });
});
