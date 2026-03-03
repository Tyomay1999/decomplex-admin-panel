import type { PlaywrightTestConfig } from "@playwright/test";
import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";

const config: PlaywrightTestConfig = defineConfig({
  testDir: "./e2e/specs",
  timeout: 60_000,
  expect: { timeout: 10_000 },

  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  webServer: {
    command: "npm run dev -- --host --port 5173",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});

export default config;
