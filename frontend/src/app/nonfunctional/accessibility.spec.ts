import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { axe, toHaveNoViolations } from 'jasmine-axe';

import { RessourceListComponent } from '../features/resources/pages/ressource-list/ressource-list.component';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { LoginComponent } from '../features/auth/pages/login/login.component';
import { RessourceService, Ressource } from '../features/resources/services/ressource.service';
import { AuthService } from '../core/services/auth.service';
import { of } from 'rxjs';

/** Helper : extrait les violations critiques/serious depuis les résultats axe bruts */
function getBloquantes(rawResults: unknown): any[] {
  const r = rawResults as { violations: any[] };
  return r.violations.filter((v: any) => v.impact === 'critical' || v.impact === 'serious');
}

function formatViolations(bloquantes: any[]): string {
  return bloquantes.map((v: any) => `[${v.impact}] ${v.id}: ${v.description}`).join(' | ');
}

const mockRessources: Ressource[] = [
  {
    id: 1,
    title: 'Guide communication couple',
    description: 'Apprendre a communiquer',
    content: 'Contenu',
    author: 'Alice Dupont',
    category: 'Couple',
    createdAt: new Date('2026-01-01'),
    type: 'article',
    visibilite: 'Publique',
    statut: 'Publi\u00e9e',
  },
];

/**
 * CT-A11Y-001 — Score accessibilité RGAA / axe-core
 * Vérifie l'absence de violations d'accessibilité critiques (critical/serious)
 * sur les composants principaux de l'application.
 */
describe('CT-A11Y-001 — Accessibilite (axe-core)', () => {
  beforeAll(() => {
    jasmine.addMatchers(toHaveNoViolations);
  });

  // ─── Composant NavbarComponent ────────────────────────────────────────────────
  describe('NavbarComponent', () => {
    let fixture: ComponentFixture<NavbarComponent>;

    beforeEach(async () => {
      const authSpy = jasmine.createSpyObj('AuthService', [
        'isLoggedIn', 'isAdmin', 'getCurrentUser', 'logout',
      ]);
      authSpy.isLoggedIn.and.returnValue(false);
      authSpy.isAdmin.and.returnValue(false);
      authSpy.getCurrentUser.and.returnValue(null);

      await TestBed.configureTestingModule({
        imports: [NavbarComponent, RouterTestingModule, HttpClientTestingModule],
        providers: [{ provide: AuthService, useValue: authSpy }],
      }).compileComponents();

      fixture = TestBed.createComponent(NavbarComponent);
      fixture.detectChanges();
    });

    it('ne devrait pas avoir de violations d\'accessibilite critiques', async () => {
      const raw = await axe(fixture.nativeElement, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      });
      const bloquantes = getBloquantes(raw);
      expect(bloquantes.length)
        .withContext('Violations : ' + formatViolations(bloquantes))
        .toBe(0);
    });
  });

  // ─── Composant LoginComponent ─────────────────────────────────────────────────
  describe('LoginComponent', () => {
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(async () => {
      const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'isAdmin', 'login']);
      authSpy.isLoggedIn.and.returnValue(false);
      authSpy.isAdmin.and.returnValue(false);

      await TestBed.configureTestingModule({
        imports: [LoginComponent, RouterTestingModule, ReactiveFormsModule],
        providers: [{ provide: AuthService, useValue: authSpy }],
      }).compileComponents();

      fixture = TestBed.createComponent(LoginComponent);
      fixture.detectChanges();
    });

    it('formulaire de connexion ne devrait pas avoir de violations critiques', async () => {
      const raw = await axe(fixture.nativeElement, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      });
      const bloquantes = getBloquantes(raw);
      expect(bloquantes.length)
        .withContext('Violations : ' + formatViolations(bloquantes))
        .toBe(0);
    });

    it('le champ email doit avoir un label associe', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const emailInput = compiled.querySelector('#email') as HTMLInputElement;
      const emailLabel = compiled.querySelector('label[for="email"]');
      expect(emailInput).toBeTruthy();
      expect(emailLabel).toBeTruthy();
    });

    it('le champ mot de passe doit avoir un label associe', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const pwdInput = compiled.querySelector('#password') as HTMLInputElement;
      const pwdLabel = compiled.querySelector('label[for="password"]');
      expect(pwdInput).toBeTruthy();
      expect(pwdLabel).toBeTruthy();
    });
  });

  // ─── Composant RessourceListComponent ────────────────────────────────────────
  describe('RessourceListComponent', () => {
    let fixture: ComponentFixture<RessourceListComponent>;

    beforeEach(async () => {
      const ressourceSpy = jasmine.createSpyObj('RessourceService', ['getRessources']);
      ressourceSpy.getRessources.and.returnValue(of(mockRessources));

      await TestBed.configureTestingModule({
        imports: [RessourceListComponent, RouterTestingModule],
        providers: [{ provide: RessourceService, useValue: ressourceSpy }],
      }).compileComponents();

      fixture = TestBed.createComponent(RessourceListComponent);
      fixture.detectChanges();
    });

    it('page liste ressources ne devrait pas avoir de violations critiques', async () => {
      const raw = await axe(fixture.nativeElement, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      });
      const bloquantes = getBloquantes(raw);
      expect(bloquantes.length)
        .withContext('Violations : ' + formatViolations(bloquantes))
        .toBe(0);
    });

    it('le champ de recherche doit etre present dans le DOM', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const searchInput = compiled.querySelector('input[type="text"], input[type="search"]');
      expect(searchInput).toBeTruthy();
    });

    it('le titre h1 doit etre present et non vide', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const h1 = compiled.querySelector('h1');
      expect(h1).toBeTruthy();
      expect(h1!.textContent!.trim().length).toBeGreaterThan(0);
    });
  });
});
