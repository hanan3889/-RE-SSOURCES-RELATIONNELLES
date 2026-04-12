import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'isAdmin']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  // ─── CT-SEC-001 — Accès refusé si non connecté ───────────────────────────────
  it('devrait refuser et rediriger vers /auth/login si non connecté', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);

    const result = guard.canActivate(mockRoute, mockState);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  // ─── Accès autorisé si connecté (sans rôle requis) ───────────────────────────
  it('devrait autoriser si connecté et pas de rôle requis', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;

    const result = guard.canActivate(route, mockState);

    expect(result).toBeTrue();
  });

  // ─── CT-SADM-003 — Citoyen ne peut pas accéder au Back-Office ─────────────────
  it('devrait refuser et rediriger vers /home si rôle admin requis mais pas admin', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.isAdmin.and.returnValue(false);
    const route = { data: { role: 'admin' } } as unknown as ActivatedRouteSnapshot;

    const result = guard.canActivate(route, mockState);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  // ─── Admin peut accéder au Back-Office ────────────────────────────────────────
  it('devrait autoriser si rôle admin requis et utilisateur est admin', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.isAdmin.and.returnValue(true);
    const route = { data: { role: 'admin' } } as unknown as ActivatedRouteSnapshot;

    const result = guard.canActivate(route, mockState);

    expect(result).toBeTrue();
  });
});
