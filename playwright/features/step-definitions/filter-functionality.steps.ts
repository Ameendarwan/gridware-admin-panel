import { Then, When } from '@cucumber/cucumber';
import { HomePage } from '../../page-object-models/homePage';

let homePage: HomePage;

When('the user click on the filter button', async function () {
  homePage = new HomePage(this.page);
  await homePage.clickFilterButton();
});

Then('the filters should be visible', async function () {
  await homePage.checkFiltersVisibility();
});

When('the user apply {string} filters individually', async function (pageName: string) {
  homePage.getFilterMapArray(pageName);
  await homePage.getFilters();
  await homePage.applyFiltersIndividually();
});
