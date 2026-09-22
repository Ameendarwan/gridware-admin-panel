import { Then, When } from '@cucumber/cucumber';
import { DeploymentPage } from '../../page-object-models/deployment';
import { DeploymentsPage } from '../../page-object-models/deployments';

let deploymentPage: DeploymentPage;
let deploymentsPage: DeploymentsPage;

When(
  'the user goes to {string} deployment map if it exists and turns on testing mode',
  async function (deploymentName: string) {
    if (!deploymentsPage) deploymentsPage = new DeploymentsPage(this.page);
    const deploymentExists = await deploymentsPage.checkIfDeploymentExists(deploymentName);
    if (deploymentExists) {
      console.log(`✅ Deployment "${deploymentName}" found. Clicking map icon..`);
      const page = await deploymentsPage.goToFirstDeploymentMap();
      deploymentPage = new DeploymentPage(page);
    } else {
      console.log(`⚠️ Deployment "${deploymentName}" does not exist.`);
    }
    await deploymentPage.enableTestingMode();
    await deploymentPage.verifyLoading();
  }
);

When('the user creates span', async function () {
  await deploymentPage.captureTwoSeparatedMarkers();

  await deploymentPage.reloadWithoutTestMode();
  await deploymentPage.verifyLoading();

  await deploymentPage.createSpanFromCapturedPoles();
});

Then('the span will be created', async function () {
  await deploymentPage.waitForSpanCreationSuccess();
});

When('the user deletes created span', async function () {
  await deploymentPage.enableTestingMode();
  await deploymentPage.verifyLoading();
  await deploymentPage.captureEdgeCenter();
  await deploymentPage.reloadWithoutTestMode();
  await deploymentPage.verifyLoading();

  await deploymentPage.deleteSpanBetweenPoles();
});

Then('the created span will be deleted', async function() {
  await deploymentPage.waitForSpanDeletionSuccess();
})
