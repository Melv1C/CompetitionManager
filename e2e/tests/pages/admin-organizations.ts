import { Page } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Page Object Model for the Admin Organizations page
 */
export class AdminOrganizationsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/admin/organizations');
  }

  getCreateOrganizationButton() {
    return this.page.getByRole('button', { name: 'Create Organization' });
  }

  getCreateOrganizationDialog() {
    return this.page.getByRole('dialog', { name: 'Create Organization' });
  }

  async fillCreateOrganizationForm(name: string) {
    await this.fillField('input[name="name"]', name);
  }

  async submitCreateOrganizationForm() {
    await this.page.click('button[type="submit"]');
  }
}
