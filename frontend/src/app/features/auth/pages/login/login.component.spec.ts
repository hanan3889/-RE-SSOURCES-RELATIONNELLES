import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService, AuthResponse } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

const mockAuthResponse: AuthResponse = {
  token: 'fake-token',
  idUtilisateur: 1,
  email: 'alice@example.com',
  nom: 'Dupont',
  prenom: 'Alice',
  role: 'citoyen',
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'isAdmin', 'login']);
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.isAdmin.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // CT-AUTH-010 — Connexion valide
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('le formulaire doit etre invalide si vide', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('le champ email doit exiger un format valide', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('mauvais-email');
    expect(emailControl?.valid).toBeFalse();
  });

  it('le champ password doit exiger au moins 8 caracteres', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('court');
    expect(passwordControl?.valid).toBeFalse();
  });

  it('le formulaire doit etre valide avec des donnees correctes', () => {
    component.loginForm.setValue({
      email: 'alice@example.com',
      password: 'Password@123',
      rememberMe: false
    });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('onSubmit() doit appeler authService.login avec les identifiants', fakeAsync(() => {
    authServiceSpy.login.and.returnValue(of(mockAuthResponse));
    component.loginForm.setValue({
      email: 'alice@example.com',
      password: 'Password@123',
      rememberMe: false
    });

    component.onSubmit();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'Password@123'
    });
  }));

  it('onSubmit() doit naviguer vers /mon-espace pour un citoyen', fakeAsync(() => {
    authServiceSpy.login.and.returnValue(of(mockAuthResponse));
    authServiceSpy.isAdmin.and.returnValue(false);
    component.loginForm.setValue({
      email: 'alice@example.com',
      password: 'Password@123',
      rememberMe: false
    });

    component.onSubmit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/mon-espace']);
  }));

  it('onSubmit() doit naviguer vers /dashboard pour un admin', fakeAsync(() => {
    authServiceSpy.login.and.returnValue(of({ ...mockAuthResponse, role: 'administrateur' }));
    authServiceSpy.isAdmin.and.returnValue(true);
    component.loginForm.setValue({
      email: 'admin@example.com',
      password: 'Password@123',
      rememberMe: false
    });

    component.onSubmit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('onSubmit() doit afficher un message erreur en cas d echec', fakeAsync(() => {
    authServiceSpy.login.and.returnValue(throwError(() => ({
      error: { message: 'Email ou mot de passe incorrect.' }
    })));
    component.loginForm.setValue({
      email: 'alice@example.com',
      password: 'WrongPassword1',
      rememberMe: false
    });

    component.onSubmit();
    tick();

    expect(component.errorMessage).toBe('Email ou mot de passe incorrect.');
    expect(component.isSubmitting).toBeFalse();
  }));

  it('togglePasswordVisibility() doit basculer la visibilite du mot de passe', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });
});
