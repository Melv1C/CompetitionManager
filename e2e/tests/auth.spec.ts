import { expect, test } from '@playwright/test';
import { MainLayoutPage } from './pages/main-layout';
import { SignUpPage } from './pages/signup-page';
import { TestUtils } from './utils/test-utils';

test.describe('User Authentication', () => {
  test('Sign Up - should display sign up form', async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();
    await signUpPage.verifyPageLoaded();

    // Verify form elements are present
    await expect(page.locator(signUpPage.nameInput)).toBeVisible();
    await expect(page.locator(signUpPage.emailInput)).toBeVisible();
    await expect(page.locator(signUpPage.passwordInput)).toBeVisible();
    await expect(page.locator(signUpPage.confirmPasswordInput)).toBeVisible();
    await expect(page.locator(signUpPage.submitButton)).toBeVisible();
  });

  test('Sign Up - should sign up with valid credentials', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const mainLayout = new MainLayoutPage(page);
    const utils = new TestUtils(page);
    const { name, email, password } = utils.generateTestData();

    await signUpPage.goto();
    await signUpPage.signUp(name, email, password);

    // Verify successful sign up
    await page.waitForURL('/'); // Assuming redirect to home page on success

    // Wait for layout to load
    await mainLayout.waitForLoad();

    // Try to find user avatar with first letter of name
    const firstLetter = name.charAt(0).toUpperCase();
    const avatarButton = mainLayout.getUserAvatarButton(firstLetter);
    await expect(avatarButton).toBeVisible();
  });
});
