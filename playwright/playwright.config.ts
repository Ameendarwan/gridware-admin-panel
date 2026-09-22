import { PlaywrightTestConfig } from '@playwright/test';

const baseURL = 'https://dst-web-manager.gridware-dev.tech';

const config: PlaywrightTestConfig = {
  expect: {
    timeout: 120 * 1000,
  },
  testDir: 'features/',
  testMatch: '*.feature',
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 1880 * 1000,
  reportSlowTests: null,
  // globalSetup: require.resolve('./createContext'),
  snapshotPathTemplate: 'data/screenshots/{testFileDir}/{arg}{ext}',
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    video: 'on',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    bypassCSP: true,
    launchOptions: {
      downloadsPath: 'test-results/downloads/',
      args: ['--disable-web-security', '--ignore-certificate-errors'],
    },
    actionTimeout: 120 * 1000,
    navigationTimeout: 120 * 1000,
  },
};
export default config;
