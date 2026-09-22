import { Then, When } from '@cucumber/cucumber';
import { DeploymentsPage } from '../../page-object-models/deployments';
import { DeploymentPage } from '../../page-object-models/deployment';

let deploymentsPage: DeploymentsPage;
let deploymentPage: DeploymentPage;

When('the user goes to {string} deployment map if it exists', async function (deploymentName: string) {
  deploymentsPage = new DeploymentsPage(this.page);
  const deploymentExists = await deploymentsPage.checkIfDeploymentExists(deploymentName);
  if (deploymentExists) {
    console.log(`✅ Deployment "${deploymentName}" found. Clicking map icon..`);
    const page = await deploymentsPage.goToFirstDeploymentMap();
    deploymentPage = new DeploymentPage(page);
  } else {
    console.log(`⚠️ Deployment "${deploymentName}" does not exist.`);
    return;
  }
});

When('the user place pole on map', async function () {
  if (!deploymentPage) {
    console.log('⚠️ Deployment page is not available. Skipping placing pole.');
    return;
  }
  await deploymentPage.startAddPole();
  await deploymentPage.placePoleOnMap();
});

When(
  'the user fills the fields with {string} status pole and {string} device',
  async function (status: string, deviceType: keyof typeof deploymentPage.deviceMenuLocators) {
    if (status !== 'INSTALLED') {
      await deploymentPage.selectStatus(status as keyof typeof deploymentPage.statusOptionsLocators);
    }
    await deploymentPage.writeInaccessibleComment();
    if (status === 'INSTALLED') {
      await deploymentPage.selectDevice(deviceType);
      await deploymentPage.enterDeviceSerial(deviceType);
      await deploymentPage.selectDeviceOrientation('SOUTH');
      await deploymentPage.selectDeviceConnectivity('CONNECTED');
      await deploymentPage.selectInstalledAt();
      await deploymentPage.saveDevices();
    }
    await deploymentPage.selectEquipmentOptions('NONE');
    await deploymentPage.savePole();
    await deploymentPage.editCreatedPole();
    await deploymentPage.verifyIcon(status as keyof typeof deploymentPage.poleColors);
  }
);

Then('the icon should have {string} color', async function (status: keyof typeof deploymentPage.poleColors) {
  await deploymentPage.verifyIcon(status);
});
