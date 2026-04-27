import { test, expect, Page, Route } from '@playwright/test';
import { RessourceListPage } from './pages/ressource-list.page';
import { RessourceCreatePage } from './pages/ressource-create.page';
import {
  CITOYEN,
  API_BASE,
  MOCK_RESSOURCES_DTO,
  MOCK_CATEGORIES,
  MOCK_CREATED_RESSOURCE_DTO,
} from './fixtures/test-data';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function mockCategories(page: Page) {
  await page.route(/\/api\/admin\/categories/, async route => {
    await route.fulfill({ json: MOCK_CATEGORIES });
  });
}

/**
 * Intercepte toutes les requêtes vers /api/ressources/* avec filtrage côté mock.
 * Compatible avec le filtrage côté serveur ET côté client.
 */
async function mockRessourcesAPI(page: Page) {
  // Ordre important : routes plus spécifiques en premier
  await page.route(/\/api\/ressources\/restreintes/, async route => {
    const restricted = MOCK_RESSOURCES_DTO.filter(r => r.visibilite === 'Connectes');
    await route.fulfill({ json: restricted });
  });

  await page.route(/\/api\/ressources\/\d+/, async route => {
    const url = new URL(route.request().url());
    const id = parseInt(url.pathname.split('/').pop() ?? '0', 10);
    const item = MOCK_RESSOURCES_DTO.find(r => r.idRessource === id) ?? MOCK_RESSOURCES_DTO[0];
    await route.fulfill({ json: item });
  });

  await page.route(/\/api\/ressources/, async (route: Route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (method === 'POST') {
      await route.fulfill({ status: 201, json: MOCK_CREATED_RESSOURCE_DTO });
      return;
    }

    const search = (url.searchParams.get('recherche') ?? '').toLowerCase();
    const categorie = url.searchParams.get('categorie') ?? '';

    let data = [...MOCK_RESSOURCES_DTO];
    if (search) {
      data = data.filter(
        r =>
          r.titre.toLowerCase().includes(search) ||
          r.description.toLowerCase().includes(search)
      );
    }
    if (categorie) {
      data = data.filter(r => r.nomCategorie === categorie);
    }
    await route.fulfill({ json: data });
  });
}

async function authenticateAs(page: Page, user: typeof CITOYEN) {
  await page.addInitScript(u => {
    localStorage.setItem('rr_access_token', u.token);
    localStorage.setItem('currentUser', JSON.stringify(u));
  }, user);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('CT-E2E-RES — Gestion des ressources', () => {
  // ── Liste publique ─────────────────────────────────────────────────────────

  test('CT-E2E-RES-001 — Liste des ressources publiques affichée avec les données API', async ({
    page,
  }) => {
    await mockRessourcesAPI(page);
    await mockCategories(page);
    const listPage = new RessourceListPage(page);
    await listPage.goto();

    await expect(listPage.heroTitle).toContainText('Explorez nos ressources');
    // 3 ressources publiques mockées (filtre "restreintes" exclut la 3ème pour les non-connectés)
    await expect(listPage.resourceCards).toHaveCount(3);
  });

  test('CT-E2E-RES-002 — Filtre par catégorie affiche uniquement les ressources correspondantes', async ({
    page,
  }) => {
    await mockRessourcesAPI(page);
    await mockCategories(page);
    const listPage = new RessourceListPage(page);
    await listPage.goto();

    await expect(listPage.resourceCards).toHaveCount(3);
    await listPage.selectCategory('Communication');

    // Seule la ressource "Communication" doit rester
    await expect(listPage.resourceCards).toHaveCount(1);
    await expect(listPage.resourceCards.first()).toContainText('communication', {
      ignoreCase: true,
    });
  });

  test('CT-E2E-RES-003 — Recherche textuelle filtre les ressources visibles', async ({
    page,
  }) => {
    await mockRessourcesAPI(page);
    await mockCategories(page);
    const listPage = new RessourceListPage(page);
    await listPage.goto();

    await expect(listPage.resourceCards).toHaveCount(3);
    await listPage.search('conflit');

    // Seule la ressource "Atelier gestion des conflits" correspond
    await expect(listPage.resourceCards).toHaveCount(1);
    await expect(listPage.resourceCards.first()).toContainText('conflit', { ignoreCase: true });
  });

  test('CT-E2E-RES-004 — Réinitialisation des filtres remet les valeurs par défaut', async ({
    page,
  }) => {
    await mockRessourcesAPI(page);
    await mockCategories(page);
    const listPage = new RessourceListPage(page);
    await listPage.goto();

    await listPage.search('conflit');
    await expect(listPage.resourceCards).toHaveCount(1);

    await listPage.resetFilters();
    await expect(listPage.searchInput).toHaveValue('');
    await expect(listPage.resourceCards).toHaveCount(3);
  });

  // ── Authentification et création ───────────────────────────────────────────

  test('CT-E2E-RES-005 — Bouton "Créer une ressource" absent si non connecté', async ({
    page,
  }) => {
    await mockRessourcesAPI(page);
    await mockCategories(page);
    const listPage = new RessourceListPage(page);
    await listPage.goto();

    await expect(listPage.createResourceButton).not.toBeVisible();
  });

  test('CT-E2E-RES-006 — Bouton "Créer une ressource" présent si connecté', async ({
    page,
  }) => {
    await authenticateAs(page, CITOYEN);
    await mockRessourcesAPI(page);
    await mockCategories(page);
    const listPage = new RessourceListPage(page);
    await listPage.goto();

    await expect(listPage.createResourceButton).toBeVisible();
  });

  test('CT-E2E-RES-007 — Formulaire de création : champs vides affichent des erreurs de validation', async ({
    page,
  }) => {
    await authenticateAs(page, CITOYEN);
    await mockCategories(page);
    const createPage = new RessourceCreatePage(page);
    await createPage.goto();

    await expect(createPage.pageTitle).toContainText('Créer une nouvelle ressource');

    // Toucher le champ titre puis le vider déclenche la validation
    await createPage.titreInput.fill('x');
    await createPage.titreInput.fill('');
    await createPage.titreInput.blur();
    await expect(createPage.titrValidationError).toBeVisible();
  });

  test('CT-E2E-RES-008 — Création réussie redirige vers /ressources', async ({ page }) => {
    await authenticateAs(page, CITOYEN);
    await mockRessourcesAPI(page);
    await mockCategories(page);
    const createPage = new RessourceCreatePage(page);
    await createPage.goto();

    await createPage.fillForm({
      titre: 'Ma nouvelle ressource E2E',
      description: 'Description de test pour le test E2E Playwright.',
      categorieIndex: 0,
    });
    await createPage.submit();

    await expect(page).toHaveURL(/\/ressources/);
  });
});
