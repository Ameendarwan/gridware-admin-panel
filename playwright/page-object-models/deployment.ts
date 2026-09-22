import { expect, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class DeploymentPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly placeButtonText = 'Place';

  private readonly imageUploadLocator = '[data-testid="file-input"]';

  private readonly statusText = 'Status';

  readonly statusOptionsLocators = {
    NO_STATUS: '[data-testid="pole-status-pending"]',
    INSTALL_BLOCKED: '[data-testid="pole-status-install blocked"]',
    NOT_VISIBLE: '[data-testid="pole-status-not visible"]',
    UNBLOCKED: '[data-testid="pole-status-unblocked"]',
  } as const;

  private readonly optionsListSaveLocator = '[data-testid="options-list-save"]';

  private readonly accessEffortsLocator = '[data-testid="access-efforts"]';

  private readonly accessEffortsMenuLocator = {
    LEFT_DOORHANGER: '[data-testid="access-efforts-Left Doorhanger"]',
    CALLED_CGI_HOTLINE: '[data-testid="access-efforts-Called CGI Hotline"]',
    NO_ACCESS_INFO_AVAILABLE: '[data-testid="access-efforts-No Access Info Available"]',
    USED_ACCESS_INFO_DID_NOT_WORK: '[data-testid="access-efforts-Used Access Info, Did not Work"]',
    SPOKE_WITH_PROPERTY_OWNER_IN_PERSON: '[data-testid="access-efforts-Spoke with Property Owner in Person"]',
    CALLED_PROPERTY_OWNER_NO_VOICEMAIL: '[data-testid="access-efforts-Called Property Owner - No Voicemail"]',
    CALLED_PROPERTY_OWNER_LEFT_VOICEMAIL: '[data-testid="access-efforts-Called Property Owner - Left Voicemail"]',
    CALLED_PROPERTY_OWNER_SPOKE_WITH_OWNER: '[data-testid="access-efforts-Called Property Owner - Spoke with Owner"]',
    NONE: '[data-testid="access-efforts-None"]',
  } as const;

  private readonly inaccessibleCommentText = 'Inaccessible Comment';

  private readonly inaccessibleCommentLocator = '[data-testid="status-reason"]';

  private readonly deviceText = 'Device';

  readonly deviceMenuLocators = {
    GRIDSCOPE: '[data-testid="devices-options-GRIDSCOPE"]',
    WEATHER_STATION: '[data-testid="devices-options-WEATHER STATION"]',
  } as const;

  private readonly deviceSerialPlaceholder = 'Serial no.';

  private readonly orientationLabel = 'Orientation';

  private readonly connectivityLabel = 'Connectivity';

  private readonly orientationMenuLocators = {
    EAST: '[data-testid="undefined-East"]',
    SOUTHEAST: '[data-testid="undefined-Southeast"]',
    SOUTH: '[data-testid="undefined-South"]',
    SOUTHWEST: '[data-testid="undefined-Southwest"]',
    WEST: '[data-testid="undefined-West"]',
  } as const;

  private readonly connectivityMenuLocators = {
    CONNECTED: '[data-testid="undefined-Connected"]',
    DID_NOT_CONNECT: '[data-testid="undefined-Did not Connect"]',
  } as const;

  private readonly saveDevicesButtonText = 'Save Devices';

  private readonly equimentOptionsLocator = '[data-testid="equipment-options"]';

  private readonly eqipmentMenuLocators = {
    NONE: '[data-testid="equipment-options-none"]',
    FUSE: '[data-testid="equipment-options-fuse"]',
    RECLOSER: '[data-testid="equipment-options-recloser"]',
    SWITCH: '[data-testid="equipment-options-switch"]',
  };

  private readonly installedAtText = 'Installed At';

  private readonly submitButtonText = 'Save';

  private readonly poleColorIconLocator = 'svg g > circle:nth-of-type(2)[stroke-width="5"]';

  readonly poleColors = {
    INSTALLED: '#4046CA',
    NOT_VISIBLE: '#FF89CE',
    INSTALL_BLOCKED: '#D83020',
    UNBLOCKED: '#2EE489',
    NO_STATUS: '#686868',
  };

  private readonly poleMarkerSel = '[data-testid^="pole-"]';

  private readonly zoomInBtnTitle = 'Zoom in';

  private canvasCoordinates: {
    x: number;
    y: number;
  } | null = null;

  private poleCoordinates: { x: number; y: number }[] = [];

  private edgeCenter: {
    x: number;
    y: number;
  } | null = null;

  async verifyLoading() {
    try {
      await this._page.waitForSelector('[data-testid="loader"]', {
        state: 'visible',
        timeout: 2000,
      });

      await this._page.waitForSelector('[data-testid="loader"]', {
        state: 'hidden',
      });

      console.log('Loader appeared and disappeared.');
    } catch {
      console.log('Loader did not appear. Skipping wait for hidden.');
    }
  }

  async startAddPole() {
    await this.verifyLoading();
    const buttons = this._page.locator('button[data-state="closed"]');
    const firstButton = buttons.nth(3);
    await firstButton.click();
  }

  async enableTestingMode() {
    const currentUrl = this._page.url();
    const url = new URL(currentUrl);
    url.searchParams.set('test-mode', 'true');
    await this._page.goto(url.toString());
  }

  async startCreateSpan() {
    await this.verifyLoading();
    const buttons = this._page.locator('button[data-state="closed"]');
    const firstButton = buttons.nth(4);
    await firstButton.click();
  }

  async getCanvasBounds() {
    const canvas = this._page.getByRole('region', { name: 'Map', exact: true });
    await canvas.waitFor({ state: 'visible' });

    const box = await canvas.boundingBox();
    return box;
  }

  async placePoleOnMap() {
    const box = await this.getCanvasBounds();
    if (box) {
      const randomX = box.x + Math.random() * box.width;
      const randomY = box.y + Math.random() * box.height;
      this.canvasCoordinates = {
        x: randomX,
        y: randomY,
      };
      await this._page.mouse.click(randomX, randomY);
    }

    const placeButton = this._page.getByText(this.placeButtonText);
    await placeButton.click();
  }

  async addImages() {
    const addImageButton = this._page.locator(this.imageUploadLocator);
    await addImageButton.setInputFiles([
      './data/assets/asset_1.png',
      './data/assets/asset_2.png',
      './data/assets/asset_3.png',
    ]);
  }

  private async clickSaveAndClose() {
    const saveAndCloseButton = this._page.locator(this.optionsListSaveLocator);
    await saveAndCloseButton.click();
  }

  async selectStatus(option: keyof typeof this.statusOptionsLocators) {
    const selectDropdown = this._page.getByText(this.statusText).locator(':scope + div button');
    await selectDropdown.click();

    const optionLocator = this._page.locator(this.statusOptionsLocators[option]);
    await optionLocator.click();

    await this.clickSaveAndClose();
  }

  async selectAccessEffort(option: keyof typeof this.accessEffortsMenuLocator) {
    const accessEffortDropdown = this._page.locator(this.accessEffortsLocator);
    await accessEffortDropdown.click();

    const optionLocator = this._page.locator(this.accessEffortsMenuLocator[option]);
    await optionLocator.click();

    await this.clickSaveAndClose();
  }

  async writeInaccessibleComment() {
    const inaccessibleCommentField = this._page.getByText(this.inaccessibleCommentText).locator(':scope + div button');
    await inaccessibleCommentField.click();

    const inaccessibleCommentTextArea = this._page.locator(this.inaccessibleCommentLocator);
    await inaccessibleCommentTextArea.pressSequentially('inaccessible comment');

    await this.clickSaveAndClose();
  }

  async selectDevice(option: keyof typeof this.deviceMenuLocators) {
    const deviceDropdown = this._page.getByText(this.deviceText, { exact: true }).locator(':scope + div button');
    await deviceDropdown.click();

    const selectDeviceOption = this._page.locator(this.deviceMenuLocators[option]);
    await selectDeviceOption.click();

    await this.clickSaveAndClose();
  }

  async enterDeviceSerial(option: keyof typeof this.deviceMenuLocators) {
    const devicePlaceholder = option === 'GRIDSCOPE' ? 'Enter GS' : '';
    const deviceSerialDropdown = this._page.getByText(devicePlaceholder);
    await deviceSerialDropdown.click();

    // const id = Math.random().toString(36).slice(2, 10);
    const serialInput = this._page.getByPlaceholder(this.deviceSerialPlaceholder);
    await serialInput.pressSequentially('112345678');

    await this.clickSaveAndClose();
  }

  async selectEquipmentOptions(option: keyof typeof this.eqipmentMenuLocators) {
    const equipmentDropdown = this._page.locator(this.equimentOptionsLocator);
    await equipmentDropdown.click();

    const equipmentOption = this._page.locator(this.eqipmentMenuLocators[option]);
    await equipmentOption.click();

    await this.clickSaveAndClose();
  }

  async selectDeviceOrientation(option: keyof typeof this.orientationMenuLocators) {
    const orientationDropdown = this._page.getByText(this.orientationLabel).locator(':scope + div button');
    // const orientationDropdown = oreintationLabel.locator('xpath=following-sibling::div[1]');
    await orientationDropdown.click();

    const orientationOption = this._page.locator(this.orientationMenuLocators[option]);
    await orientationOption.click();

    await this.clickSaveAndClose();
  }

  async selectDeviceConnectivity(option: keyof typeof this.connectivityMenuLocators) {
    const connectivityDropdown = this._page.getByText(this.connectivityLabel).locator(':scope + div button');
    await connectivityDropdown.click();

    const connectivityOption = this._page.locator(this.connectivityMenuLocators[option]);
    await connectivityOption.click();

    await this.clickSaveAndClose();
  }

  async saveDevices() {
    const saveDevicesButton = this._page.getByText(this.saveDevicesButtonText);
    await saveDevicesButton.click();
    await this.verifyLoading();
  }

  async selectInstalledAt() {
    const installedAtDatePicker = this._page.getByText(this.installedAtText).locator(':scope + div button');
    await installedAtDatePicker.click();

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    await this._page.getByLabel(formattedDate).click();
  }

  async savePole() {
    const submitButton = this._page.getByRole('button', { name: this.submitButtonText, exact: true });
    await submitButton.click();
    await this.verifyLoading();
  }

  async editCreatedPole() {
    if (!this.canvasCoordinates) return;

    const canvas = this._page.getByRole('region', { name: 'Map' , exact: true});
    const box = await canvas.boundingBox();

    if (box) {
      const { x, y } = this.canvasCoordinates;
      await this._page.mouse.click(x, y);
    }
    // await this.verifyLoading();
    await this._page.getByTitle('Edit Pole').click();
    await this.verifyLoading();
  }

  async verifyIcon(color: keyof typeof this.poleColors) {
    const getPoleIconLocator = (color: keyof typeof this.poleColors) => {
      let strokeWidth = 3;
      if (color === 'INSTALLED') {
        strokeWidth = 5;
      }
      return `svg g > circle:nth-of-type(2)[stroke-width="${strokeWidth}"]`;
    };
    const stroke = await this._page.locator(getPoleIconLocator(color)).getAttribute('stroke');
    expect(stroke).toBe(this.poleColors[color]);
  }

  private insideRect(rect: { x: number; y: number; width: number; height: number }, x: number, y: number, pad = 2) {
    return x >= rect.x + pad && x <= rect.x + rect.width - pad && y >= rect.y + pad && y <= rect.y + rect.height - pad;
  }

  private async markerCentersInCanvas(pad = 2) {
    const canvasBB = await this.getCanvasBounds();
    if (!canvasBB) throw new Error('Map canvas not visible');

    const locator = this._page.locator(this.poleMarkerSel);

    // ✅ Wait until at least one marker shows up (visible)
    await locator.first().waitFor({ state: 'visible', timeout: 5000 });

    const els = await locator.elementHandles();

    const centers: Array<{ x: number; y: number; testid?: string }> = [];

    for (const el of els) {
      try {
        await el.scrollIntoViewIfNeeded();
      } catch {
        console.log('Skipping detached pole marker');
        continue;
      }

      const bb = await el.boundingBox();
      if (!bb) {
        continue;
      }

      const cx = bb.x + bb.width / 2;
      const cy = bb.y + bb.height / 2;

      if (!this.insideRect(canvasBB, cx, cy, pad)) {
        continue;
      }

      centers.push({
        x: cx,
        y: cy,
        testid: (await el.getAttribute('data-testid')) ?? undefined,
      });
    }

    return centers;
  }

  async captureTwoSeparatedMarkers(minDistancePx = 10, maxZoomClicks = 6) {
    const pad = 10; // minimum gap from canvas edges

    for (let attempt = 0; attempt <= maxZoomClicks; attempt++) {
      const centers = await this.markerCentersInCanvas(pad);

      if (centers.length >= 2) {
        let bestA = centers[0];
        let bestB = centers[1];
        let bestD = Math.hypot(bestA.x - bestB.x, bestA.y - bestB.y);

        for (let i = 0; i < centers.length; i++) {
          for (let j = i + 1; j < centers.length; j++) {
            const a = centers[i];
            const b = centers[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d > bestD) {
              bestD = d;
              bestA = a;
              bestB = b;
            }
          }
        }

        if (bestD >= minDistancePx) {
          this.poleCoordinates = [bestA, bestB].map(p => ({ x: p.x, y: p.y }));
          console.log(
            `✅ Captured two markers (distance ${bestD.toFixed(1)}px, with ${pad}px canvas padding):`,
            this.poleCoordinates
          );
          return this.poleCoordinates;
        }

        await this.zoomInNear();
        continue;
      }

      const bb = await this.getCanvasBounds();
      if (!bb) break;
      await this.zoomInNear();
    }

    console.log('this.poleCoordinates (failed to find valid ones): ', this.poleCoordinates);

    const fallbackCenters = await this.markerCentersInCanvas(0);
    if (fallbackCenters.length >= 2) {
      const [a, b] = fallbackCenters;
      this.poleCoordinates = [a, b].map(p => ({ x: p.x, y: p.y }));
      console.log('⚠️ Using first two markers without distance constraint:', this.poleCoordinates);
      return this.poleCoordinates;
    }

    throw new Error(`Could not find two sufficiently separated markers after ${maxZoomClicks} zoom attempts`);
  }

  private async zoomInNear() {
    const zoomInBtn = this._page.getByTitle(this.zoomInBtnTitle);

    await zoomInBtn.first().click();
    await this._page.waitForTimeout(300);
  }

  async reloadWithoutTestMode() {
    const url = new URL(this._page.url());
    url.searchParams.delete('test-mode');
    await this._page.goto(url.toString());
    await this.verifyLoading();
  }

  async createSpanFromCapturedPoles() {
    if (this.poleCoordinates.length < 2) {
      throw new Error('Need 2 poles in poleCoordinates');
    }

    await this.startCreateSpan();

    const [p1, p2] = this.poleCoordinates;
    await this._page.mouse.click(p1.x, p1.y);
    await this._page.mouse.click(p2.x, p2.y);

    const doneDrawingBtn = this._page.getByRole('button', { name: 'Done Drawing' });
    await doneDrawingBtn.click();
  }

  async waitForSpanCreationSuccess() {
    await this._page.getByText('Spans created successfully', { exact: true }).waitFor({
      state: 'visible',
      timeout: 5000,
    });
  }

  async waitForSpanDeletionSuccess() {
    await this._page.getByText('Span deleted successfully', { exact: true }).waitFor({
      state: 'visible',
      timeout: 5000,
    });
  }

  async confirmRemoveSpan() {
    const btn = this._page.getByTestId('remove-edge-confirmation-btn');
    await btn.click();
  }

  async deleteSpanBetweenPoles() {
    if (!this.edgeCenter) {
      throw new Error('No Edge Center');
    }
    this._page.mouse.move(this.edgeCenter.x, this.edgeCenter.y);
    for (let i = 0; i < 1; i++) {
      await this._page.mouse.wheel(0, -2000); // negative deltaY = zoom in
      await this._page.waitForTimeout(3000); // let map settle
    }
    await this._page.mouse.click(this.edgeCenter?.x, this.edgeCenter.y);

    const deleteSpanBtn = this._page.getByRole('button', { name: 'Delete Span' });
    await deleteSpanBtn.click();

    await this.confirmRemoveSpan();
  }

  async captureEdgeCenter() {
    const edgeLocator = this._page.locator('[data-testid^="edge-"]');
    await edgeLocator.first().waitFor({ state: 'visible', timeout: 5000 });

    const el = await edgeLocator.first().elementHandle();
    if (!el) throw new Error('No edge element found');

    const bb = await el.boundingBox();
    if (!bb) throw new Error('No bounding box for edge element');

    const cx = bb.x + bb.width / 2;
    const cy = bb.y + bb.height / 2;

    console.log(`✅ Captured edge center at (${cx}, ${cy})`);
    this.edgeCenter = { x: cx, y: cy };
  }
}
