import { expect, test } from '@playwright/test';
import { SignInPage } from './pages/signin';
import { SignUpPage } from './pages/signup';

test.describe('User Authentication', () => {
  test('Sign Up - should display sign up form', async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();

    // Verify form elements are present
    await expect(page.locator(signUpPage.nameInput)).toBeVisible();
    await expect(page.locator(signUpPage.emailInput)).toBeVisible();
    await expect(page.locator(signUpPage.passwordInput)).toBeVisible();
    await expect(page.locator(signUpPage.confirmPasswordInput)).toBeVisible();
    await expect(page.locator(signUpPage.submitButton)).toBeVisible();
  });

  test('Sign In - should display sign in form', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();

    // Verify form elements are present
    await expect(page.locator(signInPage.emailInput)).toBeVisible();
    await expect(page.locator(signInPage.passwordInput)).toBeVisible();
    await expect(page.locator(signInPage.submitButton)).toBeVisible();
  });

  test('Sign Up - should sign up with valid credentials', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const { name, email, password } = signUpPage.generateTestData();

    await signUpPage.goto();
    await signUpPage.signUp(name, email, password);

    // Verify successful sign up
    await page.waitForURL('/'); // Assuming redirect to home page on success

    await expect(signUpPage.getAvatarButton(name.charAt(0).toUpperCase())).toBeVisible();
  });

  test('Sign In - should sign in with valid credentials', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();
    await signInPage.signIn('user@example.com', 'user-password');

    // Verify successful sign in
    await page.waitForURL('/'); // Assuming redirect to home page on success

    await expect(signInPage.getAvatarButton('U')).toBeVisible();
  });

  test('Sign Up/Sign In form is not accessible when already authenticated', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const signUpPage = new SignUpPage(page);

    // Sign in and authenticate
    await signInPage.goto();
    await signInPage.signIn('user@example.com', 'user-password');

    await page.waitForURL('/');

    await signInPage.goto();
    // Expect the url to be the home page
    await expect(page).toHaveURL('/');

    await signUpPage.goto();
    // Expect the url to be the home page
    await expect(page).toHaveURL('/');
  });
});
