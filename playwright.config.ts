import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 3,
  use: { baseURL: "http://127.0.0.1:4321", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    {
      name: "react18",
      testMatch: /(?:interaction|features)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @react-pinote/demo run preview --port 4321",
      env: { ASTRO_PREVIEW_BACKGROUND: "1" },
      url: "http://127.0.0.1:4321",
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        "pnpm --filter react-pinote exec vite --config browser.config.ts",
      url: "http://127.0.0.1:4322",
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        "pnpm --filter react-pinote exec vite --config browser.react18.config.ts",
      url: "http://127.0.0.1:4323",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
