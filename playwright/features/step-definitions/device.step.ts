import { When, Then } from '@cucumber/cucumber';

import { credentials } from '../../data/credentials/credentials';
import { navbarItems } from '../../data/files/navbarData';
import { HomePage } from '../../page-object-models/homePage';
import { DevicesPage } from '../../page-object-models/device';

let homePage: HomePage;
let devicesPage: DevicesPage;
const envCredentials = credentials;
When('the user logs in for devices operations', async function () {
    homePage = new HomePage(this.page);
    devicesPage = new DevicesPage(this.page);
    await homePage.login(envCredentials.email, envCredentials.password);
});

Then('the navbar should be visible Devices operations', async function () {
    await homePage.verifyNavbarItemsVisible(navbarItems);
});

When('the user navigates to Devices page', async function () {
    await homePage.navigateTo("Devices");
});

Then('the user clicks on Add New Device button', async function () {
    await devicesPage.clickAddNewDevice();
});

When('the user adds info for new device and click save button', async function () {
    this.deviceData = await devicesPage.fillDeviceForm();
});

Then('the user verifies search field visibility and verifies device presence', async function () {
    await devicesPage.checkSearchFieldVisible();
    await devicesPage.searchDevice(this.deviceData);
    await devicesPage.verifyDeviceInSearchResults(this.deviceData);
});

// When('the user again click on add new device', async function () {
//     await devicesPage.clickAddNewDevice();
// });

// Then('the user adds a new device again', async function () {
//     await devicesPage.addDuplicateDevice(this.deviceData);
// });