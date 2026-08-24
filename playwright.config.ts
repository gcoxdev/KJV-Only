import { existsSync } from "node:fs"
import { defineConfig, devices } from "@playwright/test"

const systemChromium = "/usr/bin/chromium"
const useProductionPreview = Boolean(process.env.PLAYWRIGHT_USE_PREVIEW)

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 90_000,
  expect: {
    timeout: 60_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: existsSync(systemChromium)
      ? { executablePath: systemChromium }
      : undefined,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: useProductionPreview
      ? "npm run preview -- --port 4173"
      : "npm run dev -- --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
