import { Page } from '@playwright/test';
import { MainLayoutPage } from './main-layout';

/**
 * Page Object Model for the Sign Up page
 */
export class SignUpPage extends MainLayoutPage {
  public readonly nameInput = 'input[name="name"]';
  public readonly emailInput = 'input[type="email"]';
  public readonly passwordInput = 'input[name="password"]';
  public readonly confirmPasswordInput = 'input[name="confirmPassword"]';
  public readonly submitButton = 'button[type="submit"]';
  public readonly signInLink = 'a[href*="sign-in"]';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/auth/sign-up');
  }

  async fillName(name: string) {
    await this.fillField(this.nameInput, name);
  }

  async fillEmail(email: string) {
    await this.fillField(this.emailInput, email);
  }

  async fillPassword(password: string) {
    await this.fillField(this.passwordInput, password);
  }

  async fillConfirmPassword(confirmPassword: string) {
    await this.fillField(this.confirmPasswordInput, confirmPassword);
  }

  async clickSubmit() {
    await this.page.click(this.submitButton);
  }

  async signUp(name: string, email: string, password: string, confirmPassword?: string) {
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword || password);
    await this.clickSubmit();
  }

  async clickSignInLink() {
    await this.page.click(this.signInLink);
  }
}
