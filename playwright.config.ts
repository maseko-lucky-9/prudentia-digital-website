import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Browser/UI specs only. Worker-contract tests (tests/worker/*.test.mjs) run
  // under `node --test` (npm run test:worker), not Playwright — without this,
  // Playwright's default matcher would also pick up *.test.mjs and fail to load
  // them (they import Worker ESM modules, not Playwright's test runner).
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: `http://localhost:${process.env.PORT || 4173}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Default to 4173 — ports 3000/3001 are often held by local dev tools
    // (e.g. Grafana / Docker stacks). Override via PORT env if needed.
    command: `npx serve -l ${process.env.PORT || 4173} .`,
    url: `http://localhost:${process.env.PORT || 4173}`,
    reuseExistingServer: !process.env.CI,
  },
});
