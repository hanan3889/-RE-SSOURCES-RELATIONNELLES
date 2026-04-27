import { Page, Locator } from '@playwright/test';

export class RessourceListPage {
  readonly page: Page;
  readonly heroTitle: Locator;
  readonly searchInput: Locator;
  readonly categorySelect: Locator;
  readonly formatSelect: Locator;
  readonly sortSelect: Locator;
  readonly resetFiltersButton: Locator;
  readonly createResourceButton: Locator;
  readonly resourceCards: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroTitle = page.locator('h1');
    this.searchInput = page.locator('input[placeholder="Mot-clé, titre, description..."]');
    this.categorySelect = page.locator('select').nth(0);
    this.formatSelect = page.locator('select').nth(1);
    this.sortSelect = page.locator('select').nth(2);
    this.resetFiltersButton = page.locator('button', { hasText: 'Réinitialiser les filtres' });
    this.createResourceButton = page.locator('button', { hasText: 'Créer une ressource' });
    this.resourceCards = page.locator('.feature-card');
    this.emptyMessage = page.locator('text=Aucune ressource ne correspond');
  }

  async goto() {
    await this.page.goto('/ressources');
    await this.page.waitForSelector('h1');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
  }

  async selectCategory(label: string) {
    await this.categorySelect.selectOption({ label });
  }

  async resetFilters() {
    await this.resetFiltersButton.click();
  }

  async clickCard(index = 0) {
    await this.resourceCards.nth(index).click();
  }
}
