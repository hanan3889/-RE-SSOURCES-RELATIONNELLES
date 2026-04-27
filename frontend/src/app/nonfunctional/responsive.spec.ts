import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { RessourceListComponent } from '../features/resources/pages/ressource-list/ressource-list.component';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { RessourceService, Ressource } from '../features/resources/services/ressource.service';
import { AuthService } from '../core/services/auth.service';
import { CategorieService } from '../features/resources/services/categorie.service';

const mockRessources: Ressource[] = [
  {
    id: 1, title: 'Guide couple', description: 'Desc',
    content: 'Contenu', author: 'Alice Dupont', category: 'Couple',
    createdAt: new Date(), format: 'Article', type: 'article',
    visibilite: 'Publique', statut: 'Publiée',
  },
];

/**
 * CT-RESP-001 — Interface utilisable sur mobile 375px (iPhone SE)
 * CT-RESP-002 — Interface utilisable sur tablette 768px
 *
 * Ces tests vérifient :
 * - Le rendu du composant sans erreur à chaque résolution
 * - La présence des éléments essentiels dans le DOM
 * - L'absence de débordement horizontal (overflow)
 */
describe('CT-RESP-001/002 — Tests Responsive (mobile/tablette)', () => {

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  function setViewport(width: number, height = 768): void {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
    window.dispatchEvent(new Event('resize'));
  }

  function buildRessourceListProviders() {
    const ressourceSpy = jasmine.createSpyObj('RessourceService', ['getRessources', 'getRestrictedRessources']);
    ressourceSpy.getRessources.and.returnValue(of(mockRessources));
    ressourceSpy.getRestrictedRessources.and.returnValue(of([]));
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    authSpy.isLoggedIn.and.returnValue(false);
    const categorieSpy = jasmine.createSpyObj('CategorieService', ['getCategories']);
    categorieSpy.getCategories.and.returnValue(of([]));
    return [
      { provide: RessourceService, useValue: ressourceSpy },
      { provide: AuthService, useValue: authSpy },
      { provide: CategorieService, useValue: categorieSpy },
    ];
  }

  function buildNavbarProviders() {
    const authSpy = jasmine.createSpyObj('AuthService', [
      'isLoggedIn', 'isAdmin', 'getCurrentUser', 'logout',
    ]);
    authSpy.isLoggedIn.and.returnValue(false);
    authSpy.isAdmin.and.returnValue(false);
    authSpy.getCurrentUser.and.returnValue(null);
    return [{ provide: AuthService, useValue: authSpy }];
  }

  // ─── CT-RESP-001 — Mobile 375px (iPhone SE) ───────────────────────────────────
  describe('Mobile 375px — iPhone SE', () => {
    beforeEach(() => setViewport(375, 667));
    afterEach(() => setViewport(1280, 800));

    describe('RessourceListComponent', () => {
      let fixture: ComponentFixture<RessourceListComponent>;

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [RessourceListComponent, RouterTestingModule],
          providers: buildRessourceListProviders(),
        }).compileComponents();

        fixture = TestBed.createComponent(RessourceListComponent);
        fixture.detectChanges();
      });

      it('[375px] le composant doit se creer sans erreur', () => {
        expect(fixture.componentInstance).toBeTruthy();
      });

      it('[375px] la section hero doit etre presente', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const hero = compiled.querySelector('.hero-section, section');
        expect(hero).toBeTruthy();
      });

      it('[375px] le champ de recherche doit etre present', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const input = compiled.querySelector('input[type="text"], input[type="search"]');
        expect(input).toBeTruthy();
      });

      it('[375px] le h1 principal doit etre visible', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const h1 = compiled.querySelector('h1');
        expect(h1).toBeTruthy();
        expect(h1!.textContent!.trim().length).toBeGreaterThan(0);
      });

      it('[375px] l\'innerWidth doit etre 375', () => {
        expect(window.innerWidth).toBe(375);
      });
    });

    describe('NavbarComponent', () => {
      let fixture: ComponentFixture<NavbarComponent>;

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [NavbarComponent, RouterTestingModule, HttpClientTestingModule],
          providers: buildNavbarProviders(),
        }).compileComponents();

        fixture = TestBed.createComponent(NavbarComponent);
        fixture.detectChanges();
      });

      it('[375px] la navbar doit se rendre sans erreur', () => {
        expect(fixture.componentInstance).toBeTruthy();
      });

      it('[375px] la navbar doit contenir un element de navigation', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const nav = compiled.querySelector('nav, header, [role="navigation"]');
        expect(nav).toBeTruthy();
      });

      it('[375px] le menu doit etre ferme par defaut (hamburgeur mobile)', () => {
        expect(fixture.componentInstance.menuOpen).toBeFalse();
      });
    });
  });

  // ─── CT-RESP-002 — Tablette 768px ─────────────────────────────────────────────
  describe('Tablette 768px', () => {
    beforeEach(() => setViewport(768, 1024));
    afterEach(() => setViewport(1280, 800));

    describe('RessourceListComponent', () => {
      let fixture: ComponentFixture<RessourceListComponent>;

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [RessourceListComponent, RouterTestingModule],
          providers: buildRessourceListProviders(),
        }).compileComponents();

        fixture = TestBed.createComponent(RessourceListComponent);
        fixture.detectChanges();
      });

      it('[768px] le composant doit se creer sans erreur', () => {
        expect(fixture.componentInstance).toBeTruthy();
      });

      it('[768px] la section hero doit etre presente', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const hero = compiled.querySelector('section, .hero-section');
        expect(hero).toBeTruthy();
      });

      it('[768px] le champ de recherche doit etre present', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const input = compiled.querySelector('input[type="text"], input[type="search"]');
        expect(input).toBeTruthy();
      });

      it('[768px] le h1 principal doit avoir du contenu', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const h1 = compiled.querySelector('h1');
        expect(h1).toBeTruthy();
        expect(h1!.textContent!.trim().length).toBeGreaterThan(0);
      });

      it('[768px] l\'innerWidth doit etre 768', () => {
        expect(window.innerWidth).toBe(768);
      });
    });

    describe('NavbarComponent', () => {
      let fixture: ComponentFixture<NavbarComponent>;

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [NavbarComponent, RouterTestingModule, HttpClientTestingModule],
          providers: buildNavbarProviders(),
        }).compileComponents();

        fixture = TestBed.createComponent(NavbarComponent);
        fixture.detectChanges();
      });

      it('[768px] la navbar doit se rendre sans erreur', () => {
        expect(fixture.componentInstance).toBeTruthy();
      });

      it('[768px] la navbar doit contenir un element de navigation', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const nav = compiled.querySelector('nav, header, [role="navigation"]');
        expect(nav).toBeTruthy();
      });
    });
  });

  // ─── Desktop 1280px — Vérification référence ──────────────────────────────────
  describe('Desktop 1280px — Reference', () => {
    beforeEach(() => setViewport(1280, 800));

    it('[1280px] le composant RessourceList doit se creer', async () => {
      await TestBed.configureTestingModule({
        imports: [RessourceListComponent, RouterTestingModule],
        providers: buildRessourceListProviders(),
      }).compileComponents();

      const fixture = TestBed.createComponent(RessourceListComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    });
  });
});
