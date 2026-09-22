import { expect, Locator, Page } from '@playwright/test';

const continueBtn = '#login-btn';
const userNameField = 'input#username';
const passwordField = 'input#password';
const webManagerTxt = 'text= DST Webmanager';
const signInBtn = 'button[name="action"]';

/**
 *
 * This class should be inherited by all page-object-models.
 *
 * Only functions dealing with common components should be placed here.
 */

export class BasePage {
  protected _page: Page;

  filters: string[] = [];

  private readonly filterConditions: Record<string, { allFilters: string[]; filtersToApply: string[] }> = {
    string: {
      allFilters: [
        'Equals',
        'Not',
        'Less Than',
        'Less Than equal to',
        'Greater Than equal to',
        'Greater Than',
        'Between',
        'Not Between',
        'Empty',
        'Not Empty',
        'Contains',
      ],
      filtersToApply: ['Equals', 'Contains'],
    },
    date: {
      allFilters: ['Before', 'After', 'Between', 'Not Between', 'Not', 'Empty', 'Not Empty'],
      filtersToApply: ['Between'],
    },
    boolean: {
      allFilters: ['true', 'false'],
      filtersToApply: [],
    },
  };

  private skippedHeadingIdx: number[] = [];

  filtersMapArray: string[] = [];

  private readonly UsersMapArray = [
    'ID',
    'CREATED AT',
    'UPDATED AT',
    'EMAIL',
    'PROVIDER ID',
    'IS INVITED TO AUTH0',
    'CREATED BY',
    'UPDATED BY',
  ];

  private readonly CustomersMapArray = [
    'ID',
    'CREATED AT',
    'UPDATED AT',
    'CREATED BY',
    'UPDATED BY',
    'Name',
    'DESCRIPTION',
    'GRIDWARE UUID',
  ];

  private readonly DeploymentsMapArray = [
    'ID',
    'DEPLOYMENT NAME',
    'LOCATION',
    'POLES COUNT',
    'CREATED AT',
    'UPDATED AT',
    // 'CUSTOMER ID',
    // 'CUSTOMER NAME',
    'CREATED BY',
    'UPDATED BY',
    'VALIDATED',
    // 'VALIDATION COMPLETED AT',
    // 'VALIDATION COMPLETED BY',
  ];

  private readonly PolesMapArray = [
    'ID',
    'POLE ID',
    'CREATED AT',
    'UPDATED AT',
    // 'STATUS',
    'INSTALLED AT',
    'DEPLOYMENT ID',
    'DEPLOYMENT NAME',
    // 'EPPE COMPLETE',
    // 'HAS ACTIVE SPAN CONNECTED',
    'NO OF ACTIVE SPANS',
    // 'EQUIPMENTS',
    // 'IS NON-EXISTENT',
    // 'IS MISCELLANEOUS',
    // 'IS DISABLED',
    'CREATED BY',
    'UPDATED BY',
    'GRIDWARE ID',
    'INACCESSIBLE REASON',
    'INACCESSIBLE COMMENT',
    'LAST DATE ACCESSED ATTEMPTED',
    'STATUS CHANGED AT',
    'STATUS CHANGED BY',
  ];

  private readonly DevicesMapArray = [
    'ID',
    'DEPLOYMENT NAME',
    'CREATED AT',
    'CREATED BY',
    'UPDATED BY',
    'UPDATED AT',
    'SERIAL NO',
    'TYPE',
    'POLE ID',
    'SOLAR ORIENTATION',
    'IS BLINKED',
    'NONEXISTENT',
  ];

  private readonly PublicInfoCircuitMapArray = [
    'ID',
    'CREATED AT',
    'UPDATED AT',
    'CREATED BY',
    'UPDATED BY',
    'DEPLOYMENT ID',
    // 'COORDINATES',
  ];

  private readonly CsvMapArray = ['ID', 'CREATED AT', 'UPDATED AT', 'CREATED BY', 'UPDATED BY', 'DEPLOYMENT ID'];

  private readonly SpanMapArray = [
    'ID',
    'FROM POLE ID',
    // 'FROM POLE OBJECT',
    'TO POLE ID',
    // 'TO POLE OBJECT',
    'CREATED AT',
    'UPDATED AT',
    'CREATED BY',
    'UPDATED BY',
    'DEPLOYMENT ID',
  ];

  private readonly BatchTrackingMapArray = [
    'ID',
    'CREATED AT',
    'UPDATED AT',
    'DATA TYPE',
    'Total',
    'REQUESTED BY',
    'IS COMPLETED',
    // "ERRORS"
  ];

  private readonly BugMapArray = [
    'Title',
    'Description',
    'Device Model',
    'Device Mac',
    'ID',
    'CREATED AT',
    'UPDATED AT',
    'CREATED BY',
  ];

  private filterData: Record<string, any> = {};

  constructor(page: Page) {
    this._page = page;
  }

  async login(username: string, password: string): Promise<void> {
    await this._page.click(continueBtn);
    await this._page.fill(userNameField, username);
    await this._page.fill(passwordField, password);
    await this._page.click(signInBtn);
    await expect(this._page.locator(webManagerTxt)).toBeVisible();
  }

  private getFilterGroup() {
    return this._page.getByRole('group');
  }

  private getFilterOptionByRegex(filter: string) {
    const regex = new RegExp(`^\\s*${filter}\\s*$`, 'i');
    return this.getFilterGroup().getByRole('option', { name: regex });
  }

  private async waitForLoaderState(state: 'visible' | 'hidden', timeout = 120000) {
    await this._page.waitForSelector('[data-testid="loader"]', { state, timeout });
  }

  private resolveRowIndex(row: 'first' | 'last' | number, total: number) {
    if (row === 'first') return 0;
    if (row === 'last') return total - 1;
    return row;
  }

  private async getCellValue(cell: Locator): Promise<string> {
    const svgCount = await cell.locator('svg path.fill-success').count();
    const iTagCount = await cell.locator('i').count();
    const text = (await cell.textContent())?.trim() || '';

    if (svgCount > 0) return 'True';
    if (iTagCount > 0) return 'False';
    return text;
  }

  async clickFilterButton() {
    await this._page.getByText('Filter').click();
  }

  async applyFiltersIndividually() {
    await this.extractLastRowData(this.filtersMapArray);

    for (const filter of this.filtersMapArray) {
      await this.clickFilterButton();

      const option = this.getFilterOptionByRegex(filter);
      await option.click();

      await this.testFilterConditions(filter);
      await this._page.getByRole('button', { name: 'Remove filter' }).click();

      await this.clickFilterButton();
    }
  }

  private async extractLastRowData(mapArr: string[]) {
    const cellTexts = await this.getRowData('last');
    const [...filterFieldsData] = cellTexts;

    filterFieldsData.forEach((filterValue, idx) => {
      console.log('mapArr[idx]: ', mapArr[idx]);
      console.log('filterValue: ', filterValue);
      this.filterData[mapArr[idx]] = filterValue;
    });
  }

  async verifyLoading() {
    await this.waitForLoaderState('visible');
    await this.waitForLoaderState('hidden');
  }

  private async getHeadersData() {
    const headingsCount = await this._page.locator('table thead th').count();
    const headings = await this._page.locator('table thead th span').allTextContents();
    const headingSpansCount = headings.length;

    const skippedHeadingIdx: number[] = [];
    const diff = headingsCount - headingSpansCount;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        skippedHeadingIdx.push(i);
      }
    }
    headings.forEach((heading, idx) => {
      if (!this.filtersMapArray.includes(heading)) {
        skippedHeadingIdx.push(idx + diff);
      }
    });

    this.skippedHeadingIdx = [...skippedHeadingIdx];
  }

  private async getRowData(row: 'first' | 'last' | number) {
    await this.verifyLoading();

    const rows = this._page.locator('table tbody tr');
    const rowsCount = await rows.count();

    const rowNumber = this.resolveRowIndex(row, rowsCount);

    const targetRow = rows.nth(rowNumber);
    const cells = targetRow.locator('td');
    const cellCount = await cells.count();

    const cellTexts: string[] = [];
    for (let i = 0; i < cellCount; i++) {
      const value = await this.getCellValue(cells.nth(i));
      if (this.skippedHeadingIdx.includes(i)) {
        continue;
      }
      cellTexts.push(value);
    }

    return cellTexts;
  }

  private async testFilterConditions(currentFilter: string) {
    let found = false;
    let filterConditionLocator: null | Locator = null;
    const testFilterConditions: string[] = [];
    let filterType: 'string' | 'date' | 'boolean' | null = null;

    const allFilterConditions = Object.values(this.filterConditions);

    for (const { allFilters, filtersToApply } of allFilterConditions) {
      let filterCondition = '';

      for (const currFilterCondition of allFilters) {
        filterConditionLocator = this._page.getByRole('combobox').filter({ hasText: currFilterCondition });
        const count = await filterConditionLocator.count();
        if (count > 0) {
          filterCondition = currFilterCondition;
          break;
        }
      }

      if (filterCondition && filterConditionLocator) {
        await filterConditionLocator.click();
        found = true;
        filterType = this.assignFilterType(filterCondition);

        const updatedConditions = filtersToApply.filter(c => c !== filterCondition);

        if (filterType === 'boolean') {
          testFilterConditions.push(this.filterData[filterCondition]);
        } else if (filtersToApply.includes(filterCondition)) {
          testFilterConditions.push(filterCondition, ...updatedConditions);
        } else {
          testFilterConditions.push(...updatedConditions);
        }

        const conditionOption = this._page.getByRole('option', {
          name: new RegExp(`^${filterCondition}$`, 'i'),
        });
        await conditionOption.click();
        break;
      }
    }

    if (!found || !filterConditionLocator || !filterType) return;

    for (const filterCondition of testFilterConditions) {
      await filterConditionLocator.click();

      const conditionRan = await this.handleInputs({ currentFilter, filterType, filterCondition });

      if (conditionRan) {
        const filterButton = this._page.getByRole('button', { name: currentFilter });
        await filterButton.click();
        filterConditionLocator = this._page.getByRole('combobox').filter({ hasText: filterCondition });
      }

      if (filterType === 'boolean') break;
    }
  }

  private assignFilterType(filterCondition: string) {
    if (['Equals', 'Contains'].includes(filterCondition)) {
      return 'string';
    }
    if (['Before', 'After'].includes(filterCondition)) {
      return 'date';
    }
    if (['true', 'false'].includes(filterCondition)) {
      return 'boolean';
    }
    return null;
  }

  private async handleInputs({
    filterType,
    currentFilter,
    filterCondition,
  }: {
    filterType: 'string' | 'date' | 'boolean' | null;
    currentFilter: string;
    filterCondition: string;
  }) {
    if (!filterType || !this.filterData[currentFilter]) {
      const conditionOption = this._page.getByRole('option', { name: new RegExp(`^${filterCondition}$`, 'i') });
      await conditionOption.click();
      return false;
    }
    switch (filterType) {
      case 'string':
        this.handleStringInput({ currentFilter, filterCondition });
        break;
      case 'date':
        this.handleDateInput({ currentFilter, filterCondition });
        break;
      case 'boolean':
        this.handleBooleanInput({ currentFilter });
        break;
    }
    const applyFilterButton = this._page.getByRole('button', { name: 'Apply Filters' });
    await applyFilterButton.click();

    const cellTexts = await this.getRowData('first');
    const found = this.verifyFilter({ filterType, filterField: currentFilter, cellTexts });
    if (found) {
      console.log('FILTER FOUND');
    } else {
      console.log('NOT FOUND');
    }
    return true;
  }

  private async handleStringInput({
    filterCondition,
    currentFilter,
  }: {
    filterCondition: string;
    currentFilter: string;
  }) {
    const conditionOption = this._page.getByRole('option', { name: new RegExp(`^${filterCondition}$`, 'i') });
    await conditionOption.click();
    const filterInput = this._page.getByPlaceholder('Type here...');
    const filterVal = this.filterData[currentFilter];
    if (!filterVal) return;
    await filterInput.fill(filterVal);
  }

  private async handleDateInput({
    currentFilter,
    filterCondition,
  }: {
    filterCondition: string;
    currentFilter: string;
  }) {
    const conditionOption = this._page.getByRole('option', { name: new RegExp(`^${filterCondition}$`, 'i') });
    await conditionOption.click();
    const dateString = this.filterData[currentFilter];
    const dateObj = new Date(dateString);
    const formattedDate = dateObj.toISOString().split('T')[0];
    if (!formattedDate) return;
    const fromSection = this._page.locator('div').filter({ hasText: /^From:$/ });
    const toSection = this._page.locator('div').filter({ hasText: /^To:$/ });

    await fromSection.locator('input[type="date"]').fill(formattedDate);
    await fromSection.locator('input[type="time"]').fill('00:00');

    await toSection.locator('input[type="date"]').fill(formattedDate);
    await toSection.locator('input[type="time"]').fill('23:59');
  }

  private async handleBooleanInput({ currentFilter }: { currentFilter: string }) {
    const filterCondition = this.filterData[currentFilter];
    if (!filterCondition) return;
    const conditionOption = this._page.getByRole('option', { name: new RegExp(`^${filterCondition}$`, 'i') });
    await conditionOption.click();
  }

  verifyFilter({
    filterType,
    filterField,
    cellTexts,
  }: {
    filterType: string;
    cellTexts: string[];
    filterField: string;
  }) {
    if (filterType === 'date') {
      const dateString = this.filterData[filterField];
      const dateObj = new Date(dateString);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
      if (!formattedDate) return;

      return cellTexts.find(value => value.includes(formattedDate));
    }

    return cellTexts.find(value => value === this.filterData[filterField]);
  }

  private async clickAndExtractFilters() {
    const group = this._page.getByRole('group');
    const options = group.getByRole('option');
    const count = await options.count();

    const filters: string[] = [];
    for (let i = 0; i < count; i++) {
      const filterHeading = await options.nth(i).innerText();
      filters.push(filterHeading);
    }
    this.filters = [...filters];

    await this.clickFilterButton();
  }

  async getFilters() {
    await this.clickAndExtractFilters();
    await this.getHeadersData();
  }

  getFilterMapArray(pageName: string) {
    switch (pageName) {
      case 'Users':
        this.filtersMapArray = [...this.UsersMapArray];
        break;
      case 'Customers':
        this.filtersMapArray = [...this.CustomersMapArray];
        break;
      case 'Deployments':
        this.filtersMapArray = [...this.DeploymentsMapArray];
        break;
      case 'Poles':
        this.filtersMapArray = [...this.PolesMapArray];
        break;
      case 'Devices':
        this.filtersMapArray = [...this.DevicesMapArray];
        break;
      case 'Public info circuit':
        this.filtersMapArray = [...this.PublicInfoCircuitMapArray];
        break;
      case 'CSV':
        this.filtersMapArray = [...this.CsvMapArray];
        break;
      case 'Span(s)':
        this.filtersMapArray = [...this.SpanMapArray];
        break;
      case 'Batch Tracking':
        this.filtersMapArray = [...this.BatchTrackingMapArray];
        break;
      case 'Bug':
        this.filtersMapArray = [...this.BugMapArray];
        break;
    }
  }
}

export interface StoredData {
  number: string;
}
