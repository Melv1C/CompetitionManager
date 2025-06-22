import { expect, test } from '@playwright/test';
import { SignInPage } from './pages/signin-page';
import { MainLayoutPage } from './pages/main-layout';

// Credentials from backend env defaults
const ADMIN_EMAIL = process.env.DB_SEED_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.DB_SEED_ADMIN_PASSWORD || 'admin123';
const USER_EMAIL = process.env.DB_SEED_USER_EMAIL || 'user@example.com';
const USER_PASSWORD = process.env.DB_SEED_USER_PASSWORD || 'user1234';

test.describe('User Sign In', () => {
  test('Sign In - should display sign in form', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();
    await signInPage.verifyPageLoaded();

    await expect(page.locator(signInPage.emailInput)).toBeVisible();
    await expect(page.locator(signInPage.passwordInput)).toBeVisible();
    await expect(page.locator(signInPage.submitButton)).toBeVisible();
  });

  test('Sign In - admin user', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const mainLayout = new MainLayoutPage(page);

    await signInPage.goto();
    await signInPage.signIn(ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.waitForURL('/');
    await mainLayout.waitForLoad();

    const avatarButton = mainLayout.getUserAvatarButton('A');
    await expect(avatarButton).toBeVisible();
  });

  test('Sign In - regular user', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const mainLayout = new MainLayoutPage(page);

    await signInPage.goto();
    await signInPage.signIn(USER_EMAIL, USER_PASSWORD);

    await page.waitForURL('/');
    await mainLayout.waitForLoad();

    const avatarButton = mainLayout.getUserAvatarButton('U');
    await expect(avatarButton).toBeVisible();
  });
});
