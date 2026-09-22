import { BasePage } from './basePage';
import { Page, expect } from '@playwright/test';
import { Utilities } from './utilities';

export class CustomersPage extends BasePage {
  utilities: Utilities;
  constructor(page: Page) {
    super(page);
    this.utilities = new Utilities(this._page);
  }

  async clickAddNewCustomer() {
    await this._page.getByText('New Customer').first().click();
  }

  async fillCustomerForm() {
    const { name, description, uuid } = this.utilities.generateRandomCustomerData();
    await this._page.getByLabel('Name').fill(name);
    await this._page.getByLabel('Description').fill(description);
    await this._page.getByLabel('Gridware UUID ').fill(uuid);
    await this._page.getByText('Save').first().click();
    return { name, description, uuid };
  }

  async checkSearchFieldVisible() {
    await expect(this._page.getByPlaceholder('Search')).toBeVisible();
  }

  async searchCustomer(name: string) {
    await this._page.getByPlaceholder('Search').fill(name);
    await this._page.getByPlaceholder('Search').press('Enter');
  }

  async verifyCustomerInSearchResults(name: string) {
    const row = this._page.locator('table tbody tr').filter({ hasText: name }).first();
    await expect(row).toBeVisible({ timeout: 5000 });
  }
}
