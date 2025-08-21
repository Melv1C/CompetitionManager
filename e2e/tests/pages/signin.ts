import { Page, expect } from '@playwright/test';
import { MainLayoutPage } from './main-layout';

/**
 * Page Object Model for the Sign In page
 */
export class SignInPage extends MainLayoutPage {
  public readonly emailInput = 'input[type="email"]';
  public readonly passwordInput = 'input[type="password"]';
  public readonly submitButton = 'button[type="submit"]';
  public readonly signUpLink = 'a[href*="sign-up"]';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/auth/sign-in');
  }

  async fillEmail(email: string) {
    await this.fillField(this.emailInput, email);
  }

  async fillPassword(password: string) {
    await this.fillField(this.passwordInput, password);
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
