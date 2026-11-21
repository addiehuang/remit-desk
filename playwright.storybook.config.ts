import { defineConfig, devices } from "@playwright/test";

// Accessibility checks that need a real browser and run against Storybook,
// one story at a time. The app's end-to-end tests use playwright.config.ts.
const baseURL = "http://localhost:6006";

export default defineConfig({
  testDir: "./e2e/storybook",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report/storybook" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "pnpm storybook --ci",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
