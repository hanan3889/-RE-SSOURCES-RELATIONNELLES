import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  currentStep = 1;

  registerData = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    acceptTerms: false
  };

  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';

  // Password strength
  passwordStrength = 0;
  passwordStrengthLabel = '';
  passwordStrengthColor = 'bg-gray-200';
  passwordStrengthTextColor = 'text-gray-custom';

  // Touch states pour validation
  nomTouched = false;
  prenomTouched = false;
  emailTouched = false;
  passwordTouched = false;
  confirmPasswordTouched = false;
  termsTouched = false;

  constructor(private router: Router) {}

  /**
   * Vérifie si l'email est valide
   */
  isEmailValid(): boolean {
    if (!this.registerData.email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.registerData.email);
  }

  /**
   * Vérifie si le mot de passe est valide (min 8 caractères)
   */
  isPasswordValid(): boolean {
    return this.registerData.password.length >= 8;
  }

  /**
   * Vérifie si les mots de passe correspondent
   */
  doPasswordsMatch(): boolean {
    return this.registerData.password === this.confirmPassword && this.confirmPassword.length > 0;
  }

  /**
   * Vérifie si l'étape 1 est valide
   */
  isStep1Valid(): boolean {
    return !!this.registerData.nom && !!this.registerData.prenom && this.isEmailValid();
  }

  /**
   * Vérifie si l'étape 2 est valide
   */
  isStep2Valid(): boolean {
    return this.isPasswordValid() && this.doPasswordsMatch() && this.registerData.acceptTerms;
  }

  /**
   * Passer à l'étape 2
   */
  goToStep2(): void {
    this.nomTouched = true;
    this.prenomTouched = true;
    this.emailTouched = true;

    if (this.isStep1Valid()) {
      this.currentStep = 2;
    }
  }

  /**
   * Met à jour l'indicateur de force du mot de passe
   */
  updatePasswordStrength(): void {
    const password = this.registerData.password;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    // Normaliser sur 4
    this.passwordStrength = Math.min(4, strength);

    switch (this.passwordStrength) {
      case 0:
      case 1:
        this.passwordStrengthLabel = 'Faible';
        this.passwordStrengthColor = 'bg-[#E1000F]';
        this.passwordStrengthTextColor = 'text-[#E1000F]';
        break;
      case 2:
        this.passwordStrengthLabel = 'Moyen';
        this.passwordStrengthColor = 'bg-orange-400';
        this.passwordStrengthTextColor = 'text-orange-500';
        break;
      case 3:
        this.passwordStrengthLabel = 'Fort';
        this.passwordStrengthColor = 'bg-green-500';
        this.passwordStrengthTextColor = 'text-green-600';
        break;
      case 4:
        this.passwordStrengthLabel = 'Très fort';
        this.passwordStrengthColor = 'bg-green-600';
        this.passwordStrengthTextColor = 'text-green-700';
        break;
    }
  }

  /**
   * Soumission du formulaire
   */
  onSubmit(): void {
    this.passwordTouched = true;
    this.confirmPasswordTouched = true;
    this.termsTouched = true;

    if (!this.isStep2Valid()) {
      if (!this.registerData.acceptTerms) {
        this.errorMessage = 'Veuillez accepter les conditions d\'utilisation.';
      } else if (!this.doPasswordsMatch()) {
        this.errorMessage = 'Les mots de passe ne correspondent pas.';
      } else {
        this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      }
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    // TODO: Appeler le service d'authentification quand le backend sera prêt
    // this.authService.register(this.registerData).subscribe(...)

    // Simulation d'un délai pour l'UX
    setTimeout(() => {
      this.isLoading = false;
      // Pour l'instant, on redirige simplement vers le login
      // this.router.navigate(['/auth/login']);
      console.log('Register data:', this.registerData);
    }, 1500);
  }
}
