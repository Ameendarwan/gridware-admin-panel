import { When, Then } from '@cucumber/cucumber';

import { credentials } from '../../data/credentials/credentials';
import { navbarItems } from '../../data/files/navbarData';
import { HomePage } from '../../page-object-models/homePage';
import { CustomersPage } from '../../page-object-models/customers';

let homePage: HomePage;
let customersPage: CustomersPage;
const envCredentials = credentials; 
When('the user logs in for customer operations', async function () {
    homePage = new HomePage(this.page);
    customersPage = new CustomersPage(this.page);
    await homePage.login(envCredentials.email, envCredentials.password);
});

Then('the navbar should be visible customer operations', async function () {
    await homePage.verifyNavbarItemsVisible(navbarItems);
});

When('the user navigates to {string} page', async function (pageName: string) {
    await homePage.navigateTo(pageName);
});

Then('the user clicks on Add New Customer button', async function () {
    await customersPage.clickAddNewCustomer();
});

When('the user adds info for new customer and click save button', async function () {
    this. customerData = await customersPage.fillCustomerForm();
});

Then('the user verifies that the search field is visible', async function () {
    await customersPage.checkSearchFieldVisible();
});

When('the user enters name of customer', async function () {
    await customersPage.searchCustomer(this.customerData.name);
});

Then('the user verifies that customer is present in the search results', async function () {
    await customersPage.verifyCustomerInSearchResults(this.customerData.name);
});