import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RessourceCreateComponent } from './ressource-create.component';
import { RessourceService, Ressource } from '../../services/ressource.service';
import { CategorieService, Categorie } from '../../services/categorie.service';
import { AuthService } from 'src/app/core/services/auth.service';

const mockCategories: Categorie[] = [
  { idCategorie: 1, nomCategorie: 'Couple' },
  { idCategorie: 2, nomCategorie: 'Famille' },
];

const mockRessource: Ressource = {
  id: 42,
  title: 'Guide couple',
  description: 'Description existante',
  content: 'Contenu',
  author: 'Alice Dupont',
  category: 'Couple',
  createdAt: new Date(),
  format: 'Article',
  type: 'article',
  visibilite: 'Publique',
  statut: 'Rejetée',
};

const mockEditableDto = {
  idRessource: 42,
  titre: 'Guide couple',
  description: 'Description existante',
  format: 'Article',
  visibilite: 0,
  idCategorie: 1,
};

// ─── Création (citoyen) ────────────────────────────────────────────────────

describe('RessourceCreateComponent — Création', () => {
  let component: RessourceCreateComponent;
  let fixture: ComponentFixture<RessourceCreateComponent>;
  let ressourceSpy: jasmine.SpyObj<RessourceService>;
  let router: Router;

  beforeEach(async () => {
    ressourceSpy = jasmine.createSpyObj('RessourceService', ['createRessource', 'updateRessource', 'getRessourceForEdit']);
    const categorieSpy = jasmine.createSpyObj('CategorieService', ['getCategories']);
    const authSpy = jasmine.createSpyObj('AuthService', ['isAdmin', 'getToken']);

    categorieSpy.getCategories.and.returnValue(of(mockCategories));
    authSpy.isAdmin.and.returnValue(false);
    authSpy.getToken.and.returnValue('fake-token');

    const paramMap = { get: (_key: string) => null };

    await TestBed.configureTestingModule({
      imports: [RessourceCreateComponent, RouterTestingModule, ReactiveFormsModule],
      providers: [
        { provide: RessourceService, useValue: ressourceSpy },
        { provide: CategorieService, useValue: categorieSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap } } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(RessourceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // CT-RES-010 — Création d'une ressource
  it('devrait etre en mode creation par defaut', () => {
    expect(component.isEditMode).toBeFalse();
    expect(component.resourceId).toBeNull();
  });

  it('devrait charger les categories au demarrage', () => {
    expect(component.categories.length).toBe(2);
  });

  it('le formulaire vide doit etre invalide', () => {
    component.form.get('titre')?.setValue('');
    component.form.get('idCategorie')?.setValue(null);
    expect(component.form.valid).toBeFalse();
  });

  it('le champ titre ne doit pas depasser 255 caracteres', () => {
    const longTitle = 'a'.repeat(256);
    component.form.get('titre')?.setValue(longTitle);
    expect(component.form.get('titre')?.valid).toBeFalse();
  });

  it('un formulaire valide doit etre accepte', () => {
    component.form.setValue({
      titre: 'Titre valide',
      description: 'Description valide',
      format: 'Article',
      visibilite: '0',
      idCategorie: 1,
    });
    expect(component.form.valid).toBeTrue();
  });

  it('onSubmit() avec formulaire valide doit appeler createRessource', fakeAsync(() => {
    ressourceSpy.createRessource.and.returnValue(of(mockRessource));
    component.form.setValue({
      titre: 'Titre valide',
      description: 'Description',
      format: 'Article',
      visibilite: '0',
      idCategorie: 1,
    });

    component.submit();
    tick();

    expect(ressourceSpy.createRessource).toHaveBeenCalled();
  }));

  it('onSubmit() avec formulaire invalide ne doit pas appeler createRessource', () => {
    component.submit();
    expect(ressourceSpy.createRessource).not.toHaveBeenCalled();
  });

  it('onSubmit() apres succes doit naviguer vers /ressources', fakeAsync(() => {
    ressourceSpy.createRessource.and.returnValue(of(mockRessource));
    component.form.setValue({
      titre: 'Titre',
      description: 'Desc',
      format: 'Article',
      visibilite: '0',
      idCategorie: 1,
    });

    component.submit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/ressources']);
  }));

  it('onSubmit() en cas d erreur serveur doit afficher le message', fakeAsync(() => {
    ressourceSpy.createRessource.and.returnValue(throwError(() => ({
      error: { message: 'Catégorie invalide.' }
    })));
    component.form.setValue({
      titre: 'Titre',
      description: 'Desc',
      format: 'Article',
      visibilite: '0',
      idCategorie: 99,
    });

    component.submit();
    tick();

    expect(component.errorMessage).toBe('Catégorie invalide.');
    expect(component.isSubmitting).toBeFalse();
  }));

  it('availableFormats doit exclure Activite et Jeu pour un citoyen', () => {
    expect(component.availableFormats).not.toContain('Activité');
    expect(component.availableFormats).not.toContain('Jeu');
  });
});

// ─── Édition (citoyen) ─────────────────────────────────────────────────────

describe('RessourceCreateComponent — Édition', () => {
  let component: RessourceCreateComponent;
  let fixture: ComponentFixture<RessourceCreateComponent>;
  let ressourceSpy: jasmine.SpyObj<RessourceService>;
  let router: Router;

  beforeEach(async () => {
    ressourceSpy = jasmine.createSpyObj('RessourceService', ['createRessource', 'updateRessource', 'getRessourceForEdit']);
    const categorieSpy = jasmine.createSpyObj('CategorieService', ['getCategories']);
    const authSpy = jasmine.createSpyObj('AuthService', ['isAdmin', 'getToken']);

    categorieSpy.getCategories.and.returnValue(of(mockCategories));
    authSpy.isAdmin.and.returnValue(false);
    authSpy.getToken.and.returnValue('fake-token');
    ressourceSpy.getRessourceForEdit.and.returnValue(of(mockEditableDto));

    const params: Record<string, string> = { id: '42' };
    const paramMap = { get: (key: string) => params[key] ?? null };

    await TestBed.configureTestingModule({
      imports: [RessourceCreateComponent, RouterTestingModule, ReactiveFormsModule],
      providers: [
        { provide: RessourceService, useValue: ressourceSpy },
        { provide: CategorieService, useValue: categorieSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap } } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(RessourceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // CT-RES-012 — Édition d'une ressource
  it('devrait etre en mode edition avec l id de la route', () => {
    expect(component.isEditMode).toBeTrue();
    expect(component.resourceId).toBe(42);
  });

  it('onSubmit() doit appeler updateRessource et non createRessource', fakeAsync(() => {
    ressourceSpy.updateRessource.and.returnValue(of(mockRessource));
    component.form.setValue({
      titre: 'Titre modifie',
      description: 'Nouvelle desc',
      format: 'PDF',
      visibilite: '1',
      idCategorie: 1,
    });

    component.submit();
    tick();

    expect(ressourceSpy.updateRessource).toHaveBeenCalled();
    expect(ressourceSpy.createRessource).not.toHaveBeenCalled();
  }));
});

// ─── Admin formats ─────────────────────────────────────────────────────────

describe('RessourceCreateComponent — Formats admin', () => {
  let component: RessourceCreateComponent;
  let fixture: ComponentFixture<RessourceCreateComponent>;

  beforeEach(async () => {
    const ressourceSpy = jasmine.createSpyObj('RessourceService', ['createRessource', 'updateRessource', 'getRessourceForEdit']);
    const categorieSpy = jasmine.createSpyObj('CategorieService', ['getCategories']);
    const authSpy = jasmine.createSpyObj('AuthService', ['isAdmin', 'getToken']);

    categorieSpy.getCategories.and.returnValue(of(mockCategories));
    authSpy.isAdmin.and.returnValue(true);
    authSpy.getToken.and.returnValue('fake-token');

    const paramMap = { get: (_key: string) => null };

    await TestBed.configureTestingModule({
      imports: [RessourceCreateComponent, RouterTestingModule, ReactiveFormsModule],
      providers: [
        { provide: RessourceService, useValue: ressourceSpy },
        { provide: CategorieService, useValue: categorieSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RessourceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('availableFormats doit inclure Activite et Jeu pour un admin', () => {
    expect(component.availableFormats).toContain('Activité');
    expect(component.availableFormats).toContain('Jeu');
  });
});
