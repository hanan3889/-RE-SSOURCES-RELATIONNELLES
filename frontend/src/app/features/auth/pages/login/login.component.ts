import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const { email, password } = this.loginForm.value;
      
      // Simul de connexion API
      console.log('Connexion avec:', { email, password });
      
      // TODO: Appeler le service d'authentification
      // this.authService.login(email, password).subscribe(...)
      
      setTimeout(() => {
        this.isSubmitting = false;
        // Simulate successful login by setting a token
        localStorage.setItem('authToken', 'fake-token');
        this.router.navigate(['/dashboard']);
      }, 1500);
    }
  }
}
