import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/?$/);
});
