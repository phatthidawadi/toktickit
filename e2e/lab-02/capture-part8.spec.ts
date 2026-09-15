import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Part 8 Screenshot Generator', () => {
  const screenshotsDir = path.join(process.cwd(), 'artifacts', 'lab-02', 'screenshots', 'ticket-detail');
  const brainDir = path.join('C:', 'Users', 'Acer', '.gemini', 'antigravity-ide', 'brain', '855d8c78-d2c6-4fd1-8b99-449705a942c7');

  test.beforeAll(() => {
    [screenshotsDir, brainDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  });

  test('Capture All Part 8 Screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Go to app & select Jennifer Anderson (ID 1)
    await page.goto('/');
    await page.waitForTimeout(500);

    const select = page.locator('#requester-select').first();
    if (await select.isVisible().catch(() => false)) {
      await select.selectOption('1');
      await page.locator('button:has-text("Continue")').click();
      await page.waitForTimeout(500);
    }

    // 2. Click Create Ticket in Header Nav
    await page.locator('button.nav-btn:has-text("Create Ticket")').click();
    await page.waitForTimeout(500);

    await page.locator('#category-select').selectOption({ index: 0 });
    await page.waitForTimeout(200);
    await page.locator('#system-select').selectOption({ index: 0 });

    await page.locator('#summary-input').fill('Network Connectivity & Diagnostic Log Report');
    await page.locator('#description-input').fill('Detailed description for network analysis. Uploading diagnostic logs attachment for review by support team.');

    // Submit Ticket
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    // Go to My Tickets and click the newly created ticket
    await page.locator('button.nav-btn:has-text("My Tickets")').click();
    await page.waitForTimeout(500);

    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await page.waitForTimeout(800);

    // === Item 1: Ticket Detail Read-Only View ===
    const path1 = path.join(screenshotsDir, 'part8-1-ticket-detail-readonly.png');
    const brain1 = path.join(brainDir, 'part8-1-ticket-detail-readonly.png');
    await page.screenshot({ path: path1, fullPage: true });
    fs.copyFileSync(path1, brain1);
    console.log('Saved Part 8-1:', path1);

    // === Item 2: Add Attachment Successfully ===
    const samplePdfPath = path.join(process.cwd(), 'scratch', 'network_diagnostic_log.pdf');
    if (!fs.existsSync(path.dirname(samplePdfPath))) {
      fs.mkdirSync(path.dirname(samplePdfPath), { recursive: true });
    }
    fs.writeFileSync(samplePdfPath, '%PDF-1.4 sample diagnostic logs content');

    const fileInput = page.locator('#ticket-detail-file-input');
    await fileInput.setInputFiles(samplePdfPath);
    await page.waitForTimeout(1200);

    const path2 = path.join(screenshotsDir, 'part8-2-attachment-added-success.png');
    const brain2 = path.join(brainDir, 'part8-2-attachment-added-success.png');
    await page.screenshot({ path: path2, fullPage: true });
    fs.copyFileSync(path2, brain2);
    console.log('Saved Part 8-2:', path2);

    // === Item 3: Active Download Link ===
    const path3 = path.join(screenshotsDir, 'part8-3-active-download-link.png');
    const brain3 = path.join(brainDir, 'part8-3-active-download-link.png');
    await page.screenshot({ path: path3, fullPage: true });
    fs.copyFileSync(path3, brain3);
    console.log('Saved Part 8-3:', path3);

    // === Item 4: Soft-remove modal with removal reason ===
    const removeBtn = page.locator('button:has-text("Remove")').first();
    await removeBtn.click();
    await page.waitForTimeout(400);

    const reasonInput = page.locator('#removal-reason-input');
    await reasonInput.fill('Outdated network log attachment replaced by updated diagnostic report.');
    await page.waitForTimeout(300);

    const path4 = path.join(screenshotsDir, 'part8-4-soft-remove-modal-reason.png');
    const brain4 = path.join(brainDir, 'part8-4-soft-remove-modal-reason.png');
    await page.screenshot({ path: path4, fullPage: true });
    fs.copyFileSync(path4, brain4);
    console.log('Saved Part 8-4:', path4);

    // === Item 5: Metadata showing soft-removed state (Download Disabled / 410 Gone) ===
    await page.locator('button:has-text("Remove Attachment")').click();
    await page.waitForTimeout(1000);

    const path5 = path.join(screenshotsDir, 'part8-5-removed-metadata-410-gone.png');
    const brain5 = path.join(brainDir, 'part8-5-removed-metadata-410-gone.png');
    await page.screenshot({ path: path5, fullPage: true });
    fs.copyFileSync(path5, brain5);
    console.log('Saved Part 8-5:', path5);

    // === Item 6: Unauthorized access 403 ===
    await page.locator('button.requester-change-btn').click();
    await page.waitForTimeout(400);
    await page.locator('#requester-select').selectOption('2');
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(1000);

    const path6 = path.join(screenshotsDir, 'part8-6-unauthorized-access-403.png');
    const brain6 = path.join(brainDir, 'part8-6-unauthorized-access-403.png');
    await page.screenshot({ path: path6, fullPage: true });
    fs.copyFileSync(path6, brain6);
    console.log('Saved Part 8-6:', path6);
  });
});
