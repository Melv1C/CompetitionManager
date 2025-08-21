import { type Page } from '@playwright/test';
import { BasePage } from './base-page';

export class MainLayoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Get user avatar button
   */
  getAvatarButton(initial: string) {
    return this.page.getByRole('button', { name: initial, exact: true });
  }
}
