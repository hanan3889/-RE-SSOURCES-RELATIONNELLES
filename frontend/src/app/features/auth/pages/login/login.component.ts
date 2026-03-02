import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  
  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  showPassword = false;
  isLoading = false;
  errorMessage = '';

  // Touch state pour la validation
  emailTouched = false;
  passwordTouched = false;

  constructor(private router: Router) {}

  /**
   * Vérifie si l'email est valide
   */
  isEmailValid(): boolean {
    if (!this.loginData.email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.loginData.email);
  }

  /**
   * Vérifie si le formulaire est valide
   */
  isFormValid(): boolean {
    return this.isEmailValid() && !!this.loginData.password;
  }

  /**
   * Soumission du formulaire
   */
  onSubmit(): void {
    this.emailTouched = true;
    this.passwordTouched = true;

    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    // TODO: Appeler le service d'authentification quand le backend sera prêt
    // this.authService.login(this.loginData).subscribe(...)
    
    // Simulation d'un délai pour l'UX
    setTimeout(() => {
      this.isLoading = false;
      // Pour l'instant, on redirige simplement vers l'accueil
      // this.router.navigate(['/home']);
      console.log('Login data:', this.loginData);
    }, 1500);
  }
}
