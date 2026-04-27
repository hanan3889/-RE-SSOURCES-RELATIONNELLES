import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from './auth.service';
import { environment } from 'src/environments/environment';

const mockAuthResponse: AuthResponse = {
  token: 'fake-jwt-token',
  idUtilisateur: 1,
  email: 'alice@example.com',
  nom: 'Dupont',
  prenom: 'Alice',
  role: 'citoyen',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // CT-AUTH-010 — Connexion valide
  it('login() devrait sauvegarder le token et retourner la reponse', () => {
    service.login({ email: 'alice@example.com', password: 'Password@123' }).subscribe((res) => {
      expect(res.token).toBe('fake-jwt-token');
      expect(localStorage.getItem(environment.jwtTokenName)).toBe('fake-jwt-token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);
  });

  // CT-AUTH-001 — Inscription
  it('register() devrait sauvegarder le token et retourner la reponse', () => {
    service.register({ nom: 'Dupont', prenom: 'Alice', email: 'alice@example.com', password: 'Password@123' }).subscribe((res) => {
      expect(res.email).toBe('alice@example.com');
      expect(res.role).toBe('citoyen');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);
  });

  it('isLoggedIn() devrait retourner false si pas de token', () => {
    localStorage.removeItem(environment.jwtTokenName);
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('isLoggedIn() devrait retourner true si token present', () => {
    localStorage.setItem(environment.jwtTokenName, 'some-token');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('getRole() devrait retourner null si pas connecte', () => {
    expect(service.getRole()).toBeNull();
  });

  it('getRole() devrait retourner le role stocke', () => {
    localStorage.setItem('currentUser', JSON.stringify(mockAuthResponse));
    expect(service.getRole()).toBe('citoyen');
  });

  // isAdmin
  it('isAdmin() devrait retourner false pour un citoyen', () => {
    localStorage.setItem('currentUser', JSON.stringify(mockAuthResponse));
    expect(service.isAdmin()).toBeFalse();
  });

  it('isAdmin() devrait retourner true pour un administrateur', () => {
    const adminUser = { ...mockAuthResponse, role: 'administrateur' };
    localStorage.setItem('currentUser', JSON.stringify(adminUser));
    expect(service.isAdmin()).toBeTrue();
  });

  it('isAdmin() devrait retourner true pour un super_administrateur', () => {
    const sadmUser = { ...mockAuthResponse, role: 'super_administrateur' };
    localStorage.setItem('currentUser', JSON.stringify(sadmUser));
    expect(service.isAdmin()).toBeTrue();
  });

  it('getCurrentUser() devrait retourner null si pas connecte', () => {
    expect(service.getCurrentUser()).toBeNull();
  });

  it('getCurrentUser() devrait retourner l\'utilisateur parse depuis localStorage', () => {
    localStorage.setItem('currentUser', JSON.stringify(mockAuthResponse));
    const user = service.getCurrentUser();
    expect(user).not.toBeNull();
    expect(user!.email).toBe('alice@example.com');
  });

  it('logout() devrait vider le localStorage et naviguer vers /home', () => {
    localStorage.setItem(environment.jwtTokenName, 'some-token');
    localStorage.setItem('currentUser', JSON.stringify(mockAuthResponse));

    service.logout();

    expect(localStorage.getItem(environment.jwtTokenName)).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('getToken() devrait retourner null si pas de token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('getToken() devrait retourner le token stocke', () => {
    localStorage.setItem(environment.jwtTokenName, 'test-token');
    expect(service.getToken()).toBe('test-token');
  });

  // hasRole
  it('hasRole() devrait retourner true si le role correspond', () => {
    const modUser = { ...mockAuthResponse, role: 'moderateur' };
    localStorage.setItem('currentUser', JSON.stringify(modUser));
    expect(service.hasRole('moderateur')).toBeTrue();
  });

  it('hasRole() devrait retourner false si le role ne correspond pas', () => {
    localStorage.setItem('currentUser', JSON.stringify(mockAuthResponse));
    expect(service.hasRole('moderateur')).toBeFalse();
  });

  // hasAnyRole
  it('hasAnyRole() devrait retourner true si le role est dans la liste', () => {
    const modUser = { ...mockAuthResponse, role: 'moderateur' };
    localStorage.setItem('currentUser', JSON.stringify(modUser));
    expect(service.hasAnyRole(['moderateur', 'administrateur'])).toBeTrue();
  });

  it('hasAnyRole() devrait retourner false si le role n est pas dans la liste', () => {
    localStorage.setItem('currentUser', JSON.stringify(mockAuthResponse));
    expect(service.hasAnyRole(['moderateur', 'administrateur'])).toBeFalse();
  });

  it('hasAnyRole() devrait retourner false si pas connecte', () => {
    expect(service.hasAnyRole(['moderateur', 'administrateur'])).toBeFalse();
  });
});
