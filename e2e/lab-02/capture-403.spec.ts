import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Generate All Screenshots for Submission Report', () => {
  const screenshotsDir = path.join(process.cwd(), 'artifacts', 'lab-02', 'screenshots');

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test('Capture 403 Forbidden Access Screen', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Go to app
    await page.goto('/');
    await page.waitForTimeout(500);

    // 2. Select Jennifer Anderson (ID 1)
    const select = page.locator('#requester-select').first();
    if (await select.isVisible().catch(() => false)) {
      await select.selectOption('1');
      await page.locator('button:has-text("Continue")').click();
      await page.waitForTimeout(500);
    }

    // 3. Click first ticket row to open detail view
    const firstRow = page.locator('tbody tr').first();
    await firstRow.waitFor({ state: 'visible' });
    await firstRow.click();
    await page.waitForTimeout(800);

    // 4. Click Change requester button in header
    await page.locator('button.requester-change-btn').click();
    await page.waitForTimeout(500);

    // 5. Select Michael Brown (ID 2)
    await page.locator('#requester-select').selectOption('2');
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(1000);

    // 6. Verify 403 Forbidden Access box is visible
    const forbiddenTitle = page.locator('text=403 Forbidden Access');
    await expect(forbiddenTitle).toBeVisible({ timeout: 5000 });

    // 7. Take screenshot
    const outPath = path.join(screenshotsDir, '403-forbidden-access.png');
    await page.screenshot({ path: outPath, fullPage: true });
    console.log('Successfully captured 403 screenshot to:', outPath);
  });
});
