import { BasePage } from './basePage';
import { Page, expect } from '@playwright/test';
import { Utilities } from './utilities';

export class DevicesPage extends BasePage {
  utilities: Utilities;
  constructor(page: Page) {
    super(page);
    this.utilities = new Utilities(this._page);
  }

  async clickAddNewDevice() {
    await this._page.waitForLoadState('networkidle');
    await expect(this._page.getByRole('button', { name: '+ New Device' })).toBeVisible();
    await this._page.getByRole('button', { name: '+ New Device' }).first().click();
  }

  async fillDeviceForm() {
    const SerialNumber = "GS" + Date.now().toString().slice(-8);
    await this._page.getByLabel('Serial no').fill(SerialNumber);
    await this._page.getByRole('combobox').first().click();
    await this._page.getByRole('option', { name: 'WEATHER STATION' }).click();
    await this._page.getByRole('button', { name: 'Select Pole' }).click();
    const options = this._page.locator('[data-testid^="searchable-poles-input-option-"]');
    await options.first().click();
    await this._page.getByRole('combobox').nth(1).click();
    await this._page.getByRole('option', { name: 'East' }).first().click();
    await this._page.getByRole('switch').first().click();
    await this._page.getByText('Save').first().click();
    await expect(this._page.getByText('Device created successfully')).toBeVisible();
    return SerialNumber;
  }

  async addDuplicateDevice(SerialNumber: string) {
    await this._page.getByLabel('Serial no').fill(SerialNumber);
    await this._page.getByRole('combobox').first().click();
    await this._page.getByRole('option', { name: 'WEATHER STATION' }).click();
    await this._page.getByRole('button', { name: 'Select Pole' }).click();
    const options = this._page.locator('[data-testid^="searchable-poles-input-option-"]');
    await options.first().click();
    await this._page.getByRole('combobox').nth(1).click();
    await this._page.getByRole('option', { name: 'East' }).first().click();
    await this._page.getByRole('switch').first().click();
    await this._page.getByText('Save').first().click();
    const successMsg = this._page.locator('div:has-text("Device created successfully")');
    await expect(successMsg).toBeHidden();
  }

  async checkSearchFieldVisible() {
    await expect(this._page.getByPlaceholder('Search')).toBeVisible();
  }

  async searchDevice(name: string) {
    await this._page.getByPlaceholder('Search').fill(name);
    await this._page.getByPlaceholder('Search').press('Enter');
  }

  async verifyDeviceInSearchResults(name: string) {
    const row = this._page.locator('table tbody tr').filter({ hasText: name }).first();
    await expect(row).toBeVisible({ timeout: 5000 });
  }
}
