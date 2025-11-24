// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Visual regression test configuration for SDT Law site
 * Tests against both current (/) and baseline (/_baseline/) versions
 */
module.exports = defineConfig({
  testDir: './_tests',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: '_tests/report' }],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    // Base URL for the local server (using uncommon port to avoid conflicts)
    baseURL: 'http://localhost:9753',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot settings for visual comparison
    screenshot: 'only-on-failure',
  },

  // Configure snapshot settings
  expect: {
    toHaveScreenshot: {
      // Allow some pixel difference for anti-aliasing
      maxDiffPixelRatio: 0.01,
      // Animation timeout - wait for animations to settle
      animations: 'disabled',
    },
  },

  // Define viewport sizes for each breakpoint
  // All use chromium for consistency
  projects: [
    {
      name: 'phone',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'tablet',
      use: {
        browserName: 'chromium',
        viewport: { width: 900, height: 1200 },
      },
    },
    {
      name: 'desktop',
      use: {
        browserName: 'chromium',
        viewport: { width: 1400, height: 900 },
      },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npx serve . -l 9753',
    url: 'http://localhost:9753',
    reuseExistingServer: false,  // Always start fresh to avoid conflicts
    timeout: 10000,
  },
});
