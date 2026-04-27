import { test, expect } from '@playwright/test';
import {
  CITOYEN,
  API_BASE,
  MOCK_RESSOURCES_DTO,
  MOCK_CATEGORIES,
} from './fixtures/test-data';

async function mockMinimalAPIs(page: import('@playwright/test').Page) {
  await page.route(/\/api\/ressources\/restreintes/, async route => {
    await route.fulfill({ json: [] });
  });
  await page.route(/\/api\/ressources/, async route => {
    await route.fulfill({ json: MOCK_RESSOURCES_DTO });
  });
  await page.route(/\/api\/admin\/categories/, async route => {
    await route.fulfill({ json: MOCK_CATEGORIES });
  });
}

test.describe('CT-E2E-NAV — Navigation et routage', () => {
  test('CT-E2E-NAV-001 — Redirection "/" vers "/home"', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/home/);
  });

  test('CT-E2E-NAV-002 — Clic sur le lien "Accueil" depuis les ressources', async ({ page }) => {
    await mockMinimalAPIs(page);
    await page.goto('/ressources');
    await page.waitForSelector('h1');

    await page.locator('nav a', { hasText: 'Accueil' }).click();
    await expect(page).toHaveURL(/\/home/);
  });

  test('CT-E2E-NAV-003 — Clic sur "Ressources" depuis la page d\'accueil', async ({ page }) => {
    await mockMinimalAPIs(page);
    await page.goto('/home');

    await page.locator('nav a', { hasText: 'Ressources' }).click();
    await expect(page).toHaveURL(/\/ressources/);
    await expect(page.locator('h1')).toContainText('Explorez nos ressources');
  });

  test('CT-E2E-NAV-004 — Accès /dashboard sans authentification → redirection', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    // L'AuthGuard redirige vers /auth/login si non connecté
    await expect(page).toHaveURL(/\/(auth\/login|home)/);
  });

  test("CT-E2E-NAV-005 — Lien \"S'inscrire\" depuis la page de connexion", async ({ page }) => {
    await page.goto('/auth/login');
    // Le lien S'inscrire mène vers /auth/register
    await page
      .locator('a', { hasText: "S'inscrire" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/auth\/register/);
    await expect(page.locator('h1')).toHaveText('Créer un compte');
  });

  test('CT-E2E-NAV-006 — Lien "Se connecter" depuis la page inscription', async ({ page }) => {
    await page.goto('/auth/register');
    await page.locator('a', { hasText: 'Se connecter' }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('h1')).toHaveText('Connexion');
  });

  test('CT-E2E-NAV-007 — Menu hamburger mobile : ouverture et fermeture', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/home');

    const burger = page.locator('button.burger');
    const mobileMenu = page.locator('.mobile-menu');

    // Menu fermé par défaut
    await expect(mobileMenu).not.toBeVisible();

    // Ouverture
    await burger.click();
    await expect(mobileMenu).toBeVisible();

    // Fermeture
    await burger.click();
    await expect(mobileMenu).not.toBeVisible();
  });

  test('CT-E2E-NAV-008 — Citoyen connecté voit "Mon espace" dans la navbar', async ({ page }) => {
    await page.addInitScript(u => {
      localStorage.setItem('rr_access_token', u.token);
      localStorage.setItem('currentUser', JSON.stringify(u));
    }, CITOYEN);

    await page.goto('/home');
    await expect(page.locator('nav a', { hasText: 'Mon espace' })).toBeVisible();
  });
});
