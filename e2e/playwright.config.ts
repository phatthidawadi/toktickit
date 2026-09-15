import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './lab-03',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 667 },
      },
    },
  ],
  webServer: [
    {
      command: 'npm --prefix ../server run dev',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npm --prefix ../client run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
