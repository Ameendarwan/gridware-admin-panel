import { Before, After, AfterStep, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import * as dotenv from 'dotenv';
dotenv.config();

export const baseURL = process.env.BASE_URL;
// import baseURL from '../../playwright.config'
let browser: Browser;
let context: BrowserContext;
const isCI = process.env.CI === 'true';

setDefaultTimeout(120 * 1000); // Set 60 sec global timeout

Before(async function () {
  console.log('i am first');
  browser = await chromium.launch({
    headless: isCI ? true : false,
  });
  context = await browser.newContext();
  this.page = await context.newPage();
  await this.page.goto(baseURL, {
    waitUntil: 'networkidle',
    timeout: 120000,
  });
});

AfterStep({ tags: '@smoke' }, async function ({ result }) {
  if (result?.status === Status.FAILED) {
    const page: Page = this.page;
    const buffer = await page.screenshot();
    await page.screenshot({ path: 'screenshot1.png' });
    this.attach(buffer.toString('base64'), 'base64:image/png');
    console.log('Screenshot logged');
  }
});

After(async function () {
  console.log('i am last');
  await context?.close();
  await browser?.close();
});
