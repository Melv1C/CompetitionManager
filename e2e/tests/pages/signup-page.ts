import { Page, expect } from '@playwright/test';
import { TestUtils } from '../utils/test-utils';

/**
 * Page Object Model for the Sign Up page
 */
export class SignUpPage {
  private utils: TestUtils;
  public readonly nameInput = 'input[name="name"]';
  public readonly emailInput = 'input[type="email"]';
  public readonly passwordInput = 'input[name="password"]';
  public readonly confirmPasswordInput = 'input[name="confirmPassword"]';
  public readonly submitButton = 'button[type="submit"]';
  public readonly signInLink = 'a[href*="sign-in"]';

  constructor(private page: Page) {
    this.utils = new TestUtils(page);
  }

  async goto() {
    await this.page.goto('/auth/sign-up');
  }

  async fillName(name: string) {
    await this.utils.fillField(this.nameInput, name);
  }

  async fillEmail(email: string) {
    await this.utils.fillField(this.emailInput, email);
  }

  async fillPassword(password: string) {
    await this.utils.fillField(this.passwordInput, password);
  }

  async fillConfirmPassword(confirmPassword: string) {
    await this.utils.fillField(this.confirmPasswordInput, confirmPassword);
  }

  async clickSubmit() {
    await this.page.click(this.submitButton);
  }

  async signUp(
    name: string,
    email: string,
    password: string,
    confirmPassword?: string
  ) {
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword || password);
    await this.clickSubmit();
  }

  async clickSignInLink() {
    await this.page.click(this.signInLink);
  }

  async verifyPageLoaded() {
    await expect(this.page.locator('form')).toBeVisible();
    await expect(this.page.locator(this.nameInput)).toBeVisible();
    await expect(this.page.locator(this.emailInput)).toBeVisible();
    await expect(this.page.locator(this.passwordInput)).toBeVisible();
    await expect(this.page.locator(this.confirmPasswordInput)).toBeVisible();
    await expect(this.page.locator(this.submitButton)).toBeVisible();
  }
}
