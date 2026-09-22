import { When, Then } from '@cucumber/cucumber';

import { credentials } from '../../data/credentials/credentials';
import { navbarItems } from '../../data/files/navbarData';
import { HomePage } from '../../page-object-models/homePage';
import { DeploymentsPage } from '../../page-object-models/deployments';

let homePage: HomePage;
let deploymentPage: DeploymentsPage;
const envCredentials = credentials;

When('the user logs in', async function () {
  homePage = new HomePage(this.page);
  deploymentPage = new DeploymentsPage(this.page);
  await homePage.login(envCredentials.email, envCredentials.password);
});

Then('the navbar should be visible', async function () {
  await homePage.verifyNavbarItemsVisible(navbarItems);
});

When('the user navigates to {string} and the navbar should be visible', async function (pageName: string) {
  await homePage.navigateTo(pageName);
});

When('the user views the deployment {string} if it exists', async function (deploymentName) {
  const deploymentExists = await deploymentPage.checkIfDeploymentExists(deploymentName);
  if (deploymentExists) {
    await deploymentPage.viewFirstDeployment();
  }
});

When('the user adds a new deployment with:', async function (dataTable) {
  const rows = dataTable.hashes(); // Get all rows as array of objects

  for (const row of rows) {
    const deploymentName = row['Deployment Name'];
    const location = row['Location'];
    const jsonFilePath = row['JSON File Path'];

    await deploymentPage.addNewDeployment(deploymentName, location, jsonFilePath);
  }
});
