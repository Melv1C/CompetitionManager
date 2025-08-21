import test, { expect } from '@playwright/test';
import { AdminOrganizationsPage } from './pages/admin-organizations';
import { SignInPage } from './pages/signin';

test.describe('Organization', () => {
  test.beforeEach(async ({ page }) => {
    const adminOrganizationsPage = new AdminOrganizationsPage(page);
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.signIn('admin@example.com', 'admin-password');
    await page.waitForURL('/');

    await adminOrganizationsPage.goto();
  });

  test('should create a new organization', async ({ page }) => {
    const orgName = `New Organization ${Date.now()}`;
    const adminOrganizationsPage = new AdminOrganizationsPage(page);
    await adminOrganizationsPage.getCreateOrganizationButton().click();
    expect(adminOrganizationsPage.getCreateOrganizationDialog()).toBeVisible();
    await adminOrganizationsPage.fillCreateOrganizationForm(orgName);
    await adminOrganizationsPage.submitCreateOrganizationForm();

    // Verify organization is created
    await expect(page.getByRole('cell', { name: orgName, exact: true })).toBeVisible();
  });
});
