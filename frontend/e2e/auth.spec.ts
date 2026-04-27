import { test, expect, Page } from '@playwright/test';
import { AuthPage } from './pages/auth.page';
import { CITOYEN, ADMINISTRATEUR, API_BASE } from './fixtures/test-data';

// ─── Helper: mock login/register endpoints ─────────────────────────────────

async function mockLogin(page: Page, user: typeof CITOYEN, status = 200) {
  await page.route(`${API_BASE}/auth/login`, async route => {
    if (status !== 200) {
      await route.fulfill({ status, json: { message: 'Identifiants invalides' } });
    } else {
      await route.fulfill({ json: user });
    }
  });
}

async function mockRegister(page: Page, user: typeof CITOYEN) {
  await page.route(`${API_BASE}/auth/register`, async route => {
    await route.fulfill({ status: 201, json: user });
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('CT-E2E-AUTH — Authentification', () => {
  let authPage: AuthPage;

  test.beforeEach(({ page }) => {
    authPage = new AuthPage(page);
  });

  // ── Connexion ──────────────────────────────────────────────────────────────

  test('CT-E2E-AUTH-001 — La page de connexion affiche le formulaire complet', async ({ page }) => {
    await authPage.gotoLogin();

    await expect(page.locator('h1')).toHaveText('Connexion');
    await expect(authPage.emailInput).toBeVisible();
    await expect(authPage.passwordInput).toBeVisible();
    await expect(authPage.submitButton).toBeVisible();
    // Bouton désactivé tant que le formulaire est invalide
    await expect(authPage.submitButton).toBeDisabled();
  });

  test('CT-E2E-AUTH-002 — Email au mauvais format bloque la soumission', async ({ page }) => {
    await authPage.gotoLogin();
    await authPage.emailInput.fill('email-invalide');
    await authPage.passwordInput.fill('monmotdepasse');
    // Le formulaire Angular marque l'email invalide → bouton disabled
    await expect(authPage.submitButton).toBeDisabled();
  });

  test('CT-E2E-AUTH-003 — Mot de passe vide bloque la soumission', async ({ page }) => {
    await authPage.gotoLogin();
    await authPage.emailInput.fill('user@test.com');
    // password vide → formulaire invalide
    await expect(authPage.submitButton).toBeDisabled();
  });

  test('CT-E2E-AUTH-004 — Connexion valide (citoyen) → redirection vers /mon-espace', async ({
    page,
  }) => {
    await mockLogin(page, CITOYEN);
    await authPage.gotoLogin();
    await authPage.login('citoyen@test.com', 'Password123!');
    await expect(page).toHaveURL(/\/mon-espace/);
  });

  test('CT-E2E-AUTH-005 — Connexion valide (administrateur) → redirection vers /dashboard', async ({
    page,
  }) => {
    await mockLogin(page, ADMINISTRATEUR);
    await authPage.gotoLogin();
    await authPage.login('admin@test.com', 'Password123!');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("CT-E2E-AUTH-006 — Identifiants incorrects → message d'erreur affiché", async ({
    page,
  }) => {
    await mockLogin(page, CITOYEN, 401);
    await authPage.gotoLogin();
    await authPage.login('user@test.com', 'mauvais_mdp');
    await expect(authPage.errorMessage).toBeVisible();
  });

  // ── Bascule affichage mot de passe ─────────────────────────────────────────

  test("CT-E2E-AUTH-007 — Bascule d'affichage du mot de passe (Afficher / Masquer)", async ({
    page,
  }) => {
    await authPage.gotoLogin();
    // Par défaut : type="password"
    await expect(authPage.passwordInput).toHaveAttribute('type', 'password');
    await authPage.showPasswordToggle.click();
    // Après clic : type="text"
    await expect(authPage.passwordInput).toHaveAttribute('type', 'text');
  });

  // ── Inscription ────────────────────────────────────────────────────────────

  test("CT-E2E-AUTH-008 — La page d'inscription affiche le formulaire complet", async ({
    page,
  }) => {
    await authPage.gotoRegister();

    await expect(page.locator('h1')).toHaveText('Créer un compte');
    await expect(authPage.nomInput).toBeVisible();
    await expect(authPage.prenomInput).toBeVisible();
    await expect(authPage.emailInput).toBeVisible();
    await expect(authPage.passwordInput).toBeVisible();
    await expect(authPage.confirmPasswordInput).toBeVisible();
    await expect(authPage.termsCheckbox).toBeVisible();
  });

  test('CT-E2E-AUTH-009 — Mots de passe non concordants bloquent la soumission', async ({
    page,
  }) => {
    await authPage.gotoRegister();
    await authPage.fillRegister('Dupont', 'Marie', 'user@test.com', 'Password123!', 'Autre!999');
    // La validation Angular détecte la discordance → bouton disabled
    await expect(authPage.submitButton).toBeDisabled();
  });

  test("CT-E2E-AUTH-010 — Inscription réussie → redirection vers /mon-espace", async ({
    page,
  }) => {
    await mockRegister(page, CITOYEN);
    await authPage.gotoRegister();
    await authPage.fillRegister(
      'Dupont',
      'Marie',
      'marie.dupont@test.com',
      'Password123!'
    );
    await authPage.submitRegister();
    await expect(page).toHaveURL(/\/mon-espace/);
  });

  // ── Déconnexion ────────────────────────────────────────────────────────────

  test('CT-E2E-AUTH-011 — Déconnexion → redirection /home et boutons réinitialisés', async ({
    page,
  }) => {
    // Simuler la session via localStorage avant chargement
    await page.addInitScript(u => {
      localStorage.setItem('rr_access_token', u.token);
      localStorage.setItem('currentUser', JSON.stringify(u));
    }, CITOYEN);

    await page.goto('/home');
    // L'utilisateur est connecté : bouton Déconnexion visible
    await expect(page.locator('button', { hasText: 'Déconnexion' })).toBeVisible();

    await page.locator('button', { hasText: 'Déconnexion' }).click();
    await expect(page).toHaveURL(/\/home/);
    // Après déconnexion : le bouton Se connecter réapparaît
    await expect(page.locator('a', { hasText: 'Se connecter' })).toBeVisible();
  });
});
