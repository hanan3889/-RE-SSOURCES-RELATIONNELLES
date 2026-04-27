import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly logoutButton: Locator;

  // Tabs
  readonly tabResources: Locator;
  readonly tabQueue: Locator;
  readonly tabComments: Locator;
  readonly tabCategories: Locator;
  readonly tabUsers: Locator;
  readonly tabPrivileged: Locator;
  readonly tabStats: Locator;

  // Moderation queue
  readonly queueCards: Locator;
  readonly approveButtons: Locator;
  readonly rejectButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1');
    this.logoutButton = page.locator('button', { hasText: 'Déconnexion' });

    this.tabResources = page.locator('button.dashboard-tab', { hasText: 'Ressources BO' });
    this.tabQueue = page.locator('button.dashboard-tab', { hasText: 'Validation publication' });
    this.tabComments = page.locator('button.dashboard-tab', { hasText: 'Modération commentaires' });
    this.tabCategories = page.locator('button.dashboard-tab', { hasText: 'Catégories' });
    this.tabUsers = page.locator('button.dashboard-tab', { hasText: 'Comptes utilisateurs' });
    this.tabPrivileged = page.locator('button.dashboard-tab', { hasText: 'Comptes privilégiés' });
    this.tabStats = page.locator('button.dashboard-tab', { hasText: 'Statistiques' });

    this.queueCards = page.locator('article.queue-card');
    this.approveButtons = page.locator('button.approve-btn', { hasText: 'Valider' });
    this.rejectButtons = page.locator('button.reject-btn', { hasText: 'Refuser' });
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async gotoAndWait() {
    await this.page.goto('/dashboard');
    await this.page.waitForSelector('h1');
  }

  async switchToQueueTab() {
    await this.tabQueue.click();
  }
}
