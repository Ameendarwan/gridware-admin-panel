import { Assertion } from './assertion';
import { BasePage } from './basePage';
import { Page, expect } from '@playwright/test';

/**
 * Library of functions .
 *
 */

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  assert = new Assertion(this._page);

  /**
   * Verifies visibility of each navbar item dynamically
   * @param page Playwright Page object
   * @param navItems Array of navbar item texts (e.g. ['Users', 'Deployments', ...])
   */
  async verifyNavbarItemsVisible(navItems: string[]): Promise<void> {
    for (const item of navItems) {
      const locator = this._page.locator('nav >> text=' + item); // assuming they are within a <nav> element
      // assuming they are within a <nav> element
      await expect(locator).toBeVisible({ timeout: 5000 });
    }
  }

  async navigateTo(navItem: string): Promise<void> {
    await this._page.locator('a >> text=' + navItem).click();
  }

  async checkFiltersVisibility() {
    await expect(this._page.getByRole('group')).toBeVisible();
  }
}
