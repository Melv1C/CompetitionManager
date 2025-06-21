import { Page, expect } from '@playwright/test';
import { TestUtils } from '../utils/test-utils';

/**
 * Page Object Model for the Sign In page
 */
export class SignInPage {
  private utils: TestUtils;
  public readonly emailInput = 'input[type="email"]';
  public readonly passwordInput = 'input[type="password"]';
  public readonly submitButton = 'button[type="submit"]';
  public readonly signUpLink = 'a[href*="sign-up"]';

  constructor(private page: Page) {
    this.utils = new TestUtils(page);
  }

  async goto() {
    await this.page.goto('/auth/sign-in');
  }

  async fillEmail(email: string) {
    await this.utils.fillField(this.emailInput, email);
  }

  async fillPassword(password: string) {
    await this.utils.fillField(this.passwordInput, password);
  }

  async clickSubmit() {
    await this.page.click(this.submitButton);
  }

  async signIn(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  async clickSignUpLink() {
    await this.page.click(this.signUpLink);
  }

  async verifyPageLoaded() {
    await expect(this.page.locator('form')).toBeVisible();
    await expect(this.page.locator(this.emailInput)).toBeVisible();
    await expect(this.page.locator(this.passwordInput)).toBeVisible();
    await expect(this.page.locator(this.submitButton)).toBeVisible();
  }
}
