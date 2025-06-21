import { type Locator, type Page } from '@playwright/test';

export class MainLayoutPage {
  readonly page: Page;
  readonly header: Locator;
  readonly main: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header');
    this.main = page.locator('main');
    this.footer = page.locator('footer');
  }

  /**
   * Wait for the main layout to load
   */
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.header.waitFor({ state: 'visible' });
    await this.main.waitFor({ state: 'visible' });
    await this.footer.waitFor({ state: 'visible' });
  }

  /**
   * Get user avatar button by the first letter of user's name
   * @param initial - First letter of user's name (e.g., 'T' for Tom)
   */
  getUserAvatarButton(initial: string) {
    return this.page.getByRole('button', { name: initial, exact: true });
  }
}
