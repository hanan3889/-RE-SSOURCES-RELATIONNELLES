import { test, expect, Page } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';
import {
  MODERATEUR,
  ADMINISTRATEUR,
  CITOYEN,
  API_BASE,
  MOCK_CATEGORIES,
  MOCK_MODERATION_QUEUE_DTO,
  MOCK_RESSOURCES_DTO,
} from './fixtures/test-data';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function authenticateAs(page: Page, user: typeof MODERATEUR) {
  await page.addInitScript(u => {
    localStorage.setItem('rr_access_token', u.token);
    localStorage.setItem('currentUser', JSON.stringify(u));
  }, user);
}

async function mockDashboardAPIs(page: Page) {
  // Moderation queue
  await page.route(/\/api\/moderateur\/ressources$/, async route => {
    await route.fulfill({ json: MOCK_MODERATION_QUEUE_DTO });
  });

  // Approve / Reject
  await page.route(/\/api\/moderateur\/ressources\/\d+\/valider/, async route => {
    await route.fulfill({ status: 204, body: '' });
  });
  await page.route(/\/api\/moderateur\/ressources\/\d+\/refuser/, async route => {
    await route.fulfill({ status: 204, body: '' });
  });

  // Moderation comments
  await page.route(/\/api\/moderateur\/commentaires/, async route => {
    await route.fulfill({ json: [] });
  });

  // Admin resources (BO list)
  await page.route(/\/api\/admin\/ressources/, async route => {
    await route.fulfill({ json: MOCK_RESSOURCES_DTO });
  });

  // Categories
  await page.route(/\/api\/admin\/categories/, async route => {
    await route.fulfill({ json: MOCK_CATEGORIES });
  });

  // Statistics
  await page.route(/\/api\/admin\/statistiques/, async route => {
    await route.fulfill({
      json: {
        totalRessources: 10,
        ressourcesEnValidation: 1,
        ressourcesPubliees: 5,
        totalUtilisateurs: 50,
        totalCommentaires: 20,
      },
    });
  });

  // Users (various endpoints the dashboard may call)
  await page.route(/\/api\/admin\/utilisateurs/, async route => {
    await route.fulfill({ json: [] });
  });
  await page.route(/\/api\/utilisateurs/, async route => {
    await route.fulfill({ json: [] });
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('CT-E2E-DASH — Tableau de bord Back-Office', () => {
  test('CT-E2E-DASH-001 — Modérateur accède au dashboard et voit le titre', async ({ page }) => {
    await authenticateAs(page, MODERATEUR);
    await mockDashboardAPIs(page);

    const dash = new DashboardPage(page);
    await dash.gotoAndWait();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(dash.pageTitle).toBeVisible();
    await expect(dash.tabQueue).toBeVisible();
  });

  test('CT-E2E-DASH-002 — Onglet "Validation publication" affiche la file de modération', async ({
    page,
  }) => {
    await authenticateAs(page, MODERATEUR);
    await mockDashboardAPIs(page);

    const dash = new DashboardPage(page);
    await dash.gotoAndWait();
    await dash.switchToQueueTab();

    // La ressource mockée doit apparaître dans la file
    await expect(page.locator('text=Ressource en attente de validation')).toBeVisible();
    await expect(dash.queueCards).toHaveCount(1);
  });

  test("CT-E2E-DASH-003 — Valider une ressource → ressource retirée de la file", async ({
    page,
  }) => {
    await authenticateAs(page, MODERATEUR);
    await mockDashboardAPIs(page);

    const dash = new DashboardPage(page);
    await dash.gotoAndWait();
    await dash.switchToQueueTab();

    await expect(page.locator('text=Ressource en attente de validation')).toBeVisible();

    // Clic "Valider"
    await dash.approveButtons.first().click();

    // La ressource disparaît de la file (le composant filtre localement après succès)
    await expect(page.locator('text=Ressource en attente de validation')).not.toBeVisible();
    await expect(dash.queueCards).toHaveCount(0);
  });

  test("CT-E2E-DASH-004 — Refuser une ressource → ressource retirée de la file", async ({
    page,
  }) => {
    await authenticateAs(page, MODERATEUR);
    await mockDashboardAPIs(page);

    const dash = new DashboardPage(page);
    await dash.gotoAndWait();
    await dash.switchToQueueTab();

    await expect(page.locator('text=Ressource en attente de validation')).toBeVisible();

    // Clic "Refuser"
    await dash.rejectButtons.first().click();

    // La ressource disparaît de la file
    await expect(page.locator('text=Ressource en attente de validation')).not.toBeVisible();
    await expect(dash.queueCards).toHaveCount(0);
  });

  test('CT-E2E-DASH-005 — Citoyen accédant à /dashboard → redirigé vers /home', async ({
    page,
  }) => {
    await authenticateAs(page, CITOYEN);
    await page.goto('/dashboard');
    // L'AuthGuard refuse le rôle citoyen → /home
    await expect(page).toHaveURL(/\/home/);
  });

  test('CT-E2E-DASH-006 — Administrateur voit les onglets de gestion utilisateurs', async ({
    page,
  }) => {
    await authenticateAs(page, ADMINISTRATEUR);
    await mockDashboardAPIs(page);

    const dash = new DashboardPage(page);
    await dash.gotoAndWait();

    // L'admin dispose de l'onglet "Comptes utilisateurs"
    await expect(dash.tabUsers).toBeVisible();
  });

  test('CT-E2E-DASH-007 — Déconnexion depuis le dashboard → redirection /home', async ({
    page,
  }) => {
    await authenticateAs(page, MODERATEUR);
    await mockDashboardAPIs(page);

    const dash = new DashboardPage(page);
    await dash.gotoAndWait();

    await dash.logoutButton.click();
    await expect(page).toHaveURL(/\/home/);
    await expect(page.locator('a', { hasText: 'Se connecter' })).toBeVisible();
  });
});
