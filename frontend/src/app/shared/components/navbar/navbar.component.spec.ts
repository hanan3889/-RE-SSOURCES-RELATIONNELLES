import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService, AuthResponse } from 'src/app/core/services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const mockAuthResponse: AuthResponse = {
  token: 'fake-token',
  idUtilisateur: 1,
  email: 'alice@example.com',
  nom: 'Dupont',
  prenom: 'Alice',
  role: 'citoyen',
};

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isLoggedIn', 'isAdmin', 'getCurrentUser', 'logout',
    ]);
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.isAdmin.and.returnValue(false);
    authServiceSpy.getCurrentUser.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isLoggedIn devrait etre false si non connecte', () => {
    expect(component.isLoggedIn).toBeFalse();
  });

  it('isAdmin devrait etre false par defaut', () => {
    expect(component.isAdmin).toBeFalse();
  });

  it('userName devrait etre vide si non connecte', () => {
    expect(component.userName).toBe('');
  });

  it('devrait afficher le nom de l\'utilisateur connecte', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue(mockAuthResponse);

    component.ngOnInit();

    expect(component.isLoggedIn).toBeTrue();
    expect(component.userName).toBe('Alice Dupont');
  });

  it('isAdmin devrait etre true pour un administrateur', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.isAdmin.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue({ ...mockAuthResponse, role: 'administrateur' });

    component.ngOnInit();

    expect(component.isAdmin).toBeTrue();
  });

  it('logout() devrait appeler authService.logout()', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('menuOpen devrait etre false par defaut', () => {
    expect(component.menuOpen).toBeFalse();
  });
});
