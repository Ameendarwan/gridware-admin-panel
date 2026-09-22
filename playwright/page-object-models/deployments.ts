import { Assertion } from './assertion';
import { BasePage } from './basePage';
import { Page, expect } from '@playwright/test';

const searchTxt = 'input[placeholder="Search"]';
const eyeIconBtn = '[title="View"]';
const mapIconBtn = '[title="Map"]';
const confirmDeleteBtn = 'button:has-text("Yes, delete")';
const newDeploymentBtn = 'button:has-text("New Deployment")';
const deploymentNameTxt = 'input[data-testid="deployment-name"]';
const locationTxt = 'input[name="location"]';
const jsonFileTxt = 'input[data-testid="deployment-json-file"]';
const saveDeployment = 'button[data-testid="save-btn"]';

/**
 * Method for Deployments Page .
 *
 */

export class DeploymentsPage extends BasePage {
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

  async searchDeployments(deploymentName: string): Promise<void> {
    await this._page.waitForLoadState('networkidle'); // Wait for search results to load

    await this._page.locator(searchTxt).click();
    await this._page.locator(searchTxt).fill(``);
    await this._page.locator(searchTxt).fill(deploymentName);
    await this._page.waitForLoadState('networkidle'); // Wait for search results to load
  }

  async checkIfDeploymentExists(deploymentName: string): Promise<boolean> {
    const rowLocator = this._page.locator(`text=${deploymentName}`);

    await this.searchDeployments(deploymentName);
    await this._page.waitForLoadState('networkidle');

    await this._page.waitForSelector('[data-testid="loader"]', { state: 'visible' });
    await this._page.waitForSelector('[data-testid="loader"]', { state: 'hidden' });
    return rowLocator.isVisible();
  }

  async viewFirstDeployment(): Promise<void> {
    // Trigger click and wait for new tab to open
    const viewBtn = this._page.locator(eyeIconBtn).first();

    await viewBtn.waitFor({ state: 'visible', timeout: 10000 });

    const [newPage] = await Promise.all([
      this._page
        .context()
        .waitForEvent('page', { timeout: 5000 })
        .catch(() => this._page), // fallback nếu không mở tab mới
      viewBtn.click(),
    ]);

    // Wait for the new tab to fully load
    await newPage.waitForLoadState('load');

    // Click the delete button on the new tab
    const deleteBtn = newPage.locator('button:has-text("Delete")'); // Adjust as needed
    await deleteBtn.click();
    await newPage.locator(confirmDeleteBtn).click();

    // Optionally close the new tab
    if (newPage !== this._page) {
      await newPage.close();
    }
  }

  async goToFirstDeploymentMap() {
    const mapBtn = this._page.locator(mapIconBtn).first();

    await mapBtn.waitFor({ state: 'visible', timeout: 10000 });

    const [newPage] = await Promise.all([
      this._page
        .context()
        .waitForEvent('page', { timeout: 5000 })
        .catch(() => this._page),
      mapBtn.click(),
    ]);

    await newPage.waitForLoadState('load');
    return newPage;
  }

  async addNewDeployment(deploymentName: string, location: string, jsonFilePath: string): Promise<void> {
    await this._page.locator(newDeploymentBtn).click();
    await this._page.locator(deploymentNameTxt).fill(deploymentName);
    await this._page.locator(locationTxt).fill(location);
    await this._page.locator(jsonFileTxt).setInputFiles(jsonFilePath);

    const customerDropdown = this._page.locator('label:has-text("Customer") + div');
    await customerDropdown.click();
    // Type or search to filter, optional
    await this._page.locator('input[placeholder="Search..."]').type('CUST-LARRY', { delay: 100 });

    // Click on the CUST-LARRY option
    await this._page.getByText('81027370 - CUST-LARRY', { exact: false }).click();

    // Optionally verify selection
    const selected = await this._page.locator('label:has-text("Customer") + div').textContent();
    expect(selected).toContain('CUST-LARRY');
    // Type into the searchable input to filter
    await this._page.locator('//span[text()="Select Users"]').click();

    const userSearchInput = this._page.locator('[data-testid="searchable-users-input-search-input"]');
    await userSearchInput.type('ashar.ijaz@remotebase.com', { delay: 100 });

    // Wait for the filtered result and select it
    await this._page.getByText('631449162 - ashar.ijaz@remotebase.com').click();
    await this._page.locator('//label[text()="Users "]').click();
    // Optionally press Tab or click outside to close

    // Assertion (optional)
    const selectedUsers = await this._page.locator('[data-testid="searchable-users-input-trigger"]').textContent();
    expect(selectedUsers).toContain('ashar.ijaz@remotebase.com');
    await this._page.locator(saveDeployment).click();

    await this._page.locator('text=Deployment created successfully').waitFor({ state: 'visible', timeout: 10000 });

    const rowLocator = this._page.locator(`text=${deploymentName}`);
    await this._page.waitForLoadState('networkidle');
    await this._page.reload();
    await this.searchDeployments(deploymentName);
    await this._page.waitForLoadState('networkidle');

    await expect(rowLocator).toBeVisible({
      timeout: 5000,
    });
  }
}
