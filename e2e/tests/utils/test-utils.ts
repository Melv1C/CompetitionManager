import { Page, expect } from '@playwright/test';

/**
 * Test utilities for common actions across tests
 */
export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
    });
  }

  /**
   * Fill form field and verify it was filled
   */
  async fillField(selector: string, value: string) {
    await this.page.fill(selector, value);
    await expect(this.page.locator(selector)).toHaveValue(value);
  }

  /**
   * Verify element is visible and contains text
   */
  async verifyElementWithText(selector: string, text: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    await expect(element).toContainText(text);
  }

  /**
   * Wait for toast/notification message
   */
  async waitForToast(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
    // Wait for toast to disappear
    await expect(this.page.locator(`text=${message}`)).toBeHidden({
      timeout: 10000,
    });
  }

  /**
   * Generate random test data
   */
  generateTestData() {
    const timestamp = Date.now();
    return {
      email: `test${timestamp}@example.com`,
      name: `Test User ${timestamp}`,
      password: `TestPassword${timestamp}`,
      competitionName: `Test Competition ${timestamp}`,
      organizationName: `Test Organization ${timestamp}`,
    };
  }

  /**
   * Set viewport for mobile testing
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Set viewport for tablet testing
   */
  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  /**
   * Set viewport for desktop testing
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1200, height: 800 });
  }

  /**
   * Check if element exists without throwing error
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string) {
    return this.page.waitForResponse(
      (response) =>
        response.url().includes(urlPattern) && response.status() === 200
    );
  }
}
