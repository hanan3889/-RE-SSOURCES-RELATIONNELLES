import { Page, Locator } from '@playwright/test';

export class RessourceCreatePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly titreInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly formatSelect: Locator;
  readonly visibiliteSelect: Locator;
  readonly categorieSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelLink: Locator;
  readonly errorBanner: Locator;
  readonly titrValidationError: Locator;
  readonly descriptionValidationError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1');
    this.titreInput = page.locator('#titre');
    this.descriptionTextarea = page.locator('#description');
    this.formatSelect = page.locator('#format');
    this.visibiliteSelect = page.locator('#visibilite');
    this.categorieSelect = page.locator('#idCategorie');
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelLink = page.locator('a', { hasText: 'Annuler' });
    this.errorBanner = page.locator('.bg-red-50');
    this.titrValidationError = page.locator('p.text-red-600', {
      hasText: 'Veuillez saisir un titre',
    });
    this.descriptionValidationError = page.locator('p.text-red-600', {
      hasText: 'Veuillez saisir une description',
    });
  }

  async goto() {
    await this.page.goto('/ressources/creer');
    await this.page.waitForSelector('h1');
  }

  async fillForm(opts: {
    titre: string;
    description: string;
    format?: string;
    visibilite?: string;
    categorieIndex?: number;
  }) {
    await this.titreInput.fill(opts.titre);
    await this.descriptionTextarea.fill(opts.description);
    if (opts.format) {
      await this.formatSelect.selectOption(opts.format);
    }
    if (opts.visibilite !== undefined) {
      await this.visibiliteSelect.selectOption(opts.visibilite);
    }
    if (opts.categorieIndex !== undefined) {
      // index + 1 because index 0 is the disabled placeholder "Choisissez une catégorie"
      await this.categorieSelect.selectOption({ index: opts.categorieIndex + 1 });
    }
  }

  async submit() {
    await this.submitButton.click();
  }
}
