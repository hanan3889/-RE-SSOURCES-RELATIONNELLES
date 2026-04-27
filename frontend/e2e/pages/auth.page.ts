import { Page, Locator } from '@playwright/test';

export class AuthPage {
  readonly page: Page;

  // Shared
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly showPasswordToggle: Locator;
  readonly backToHomeLink: Locator;

  // Register only
  readonly nomInput: Locator;
  readonly prenomInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly termsCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('p.text-red-500.text-sm.text-center');
    this.showPasswordToggle = page
      .locator('button[type="button"]')
      .filter({ hasText: /Afficher|Masquer/ })
      .first();
    this.backToHomeLink = page.locator('a', { hasText: "Retour à l'accueil" });
    this.nomInput = page.locator('#nom');
    this.prenomInput = page.locator('#prenom');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.termsCheckbox = page.locator('#terms');
  }

  async gotoLogin() {
    await this.page.goto('/auth/login');
    await this.page.waitForSelector('#email');
  }

  async gotoRegister() {
    await this.page.goto('/auth/register');
    await this.page.waitForSelector('#nom');
  }

  async fillLogin(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async login(email: string, password: string) {
    await this.fillLogin(email, password);
    await this.submitButton.click();
  }

  async fillRegister(
    nom: string,
    prenom: string,
    email: string,
    password: string,
    confirmPassword?: string
  ) {
    await this.nomInput.fill(nom);
    await this.prenomInput.fill(prenom);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword ?? password);
    await this.termsCheckbox.check();
  }

  async submitRegister() {
    await this.submitButton.click();
  }
}
