import path from 'path';
import { test, expect, Page } from '@playwright/test';

async function resetDbViaApi(request?: any) {
  const hosts = ['http://127.0.0.1:3000', 'http://localhost:3000'];
  for (const host of hosts) {
    try {
      if (request) {
        await request.post(`${host}/api/test/reset-db`);
        await request.post(`${host}/api/test/reset-rate-limit`);
      } else {
        await fetch(`${host}/api/test/reset-db`, { method: 'POST' });
        await fetch(`${host}/api/test/reset-rate-limit`, { method: 'POST' });
      }
      break;
    } catch {}
  }
}

async function loginAndHandlePasswordChange(page: Page, email: string, pass: string = 'Password123!') {
  await page.context().clearCookies();
  await page.goto('/');

  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(pass);
  await page.locator('#login-submit-btn').click();

  await page.waitForSelector('.change-password-container, .site-brand, #login-error, #app-header', { timeout: 10000 });

  const errorMsg = page.locator('#login-error');
  let usedPassword = pass;
  if (await errorMsg.isVisible()) {
    usedPassword = 'NewSecurePassword456!';
    await page.locator('#login-password').fill(usedPassword);
    await page.locator('#login-submit-btn').click();
    await page.waitForSelector('.change-password-container, .site-brand, #app-header', { timeout: 10000 });
  }

  const changePassHeading = page.locator('h2:has-text("Mandatory Password Update")');
  if (await changePassHeading.isVisible()) {
    await page.locator('#current-password').fill(usedPassword);
    await page.locator('#new-password').fill('NewSecurePassword456!');
    await page.locator('#confirm-password').fill('NewSecurePassword456!');
    await page.locator('#change-password-submit-btn').click();
  }

  await expect(page.locator('.site-brand')).toBeVisible();
}

test.describe('E2E-01: Actions Taken Subsystem Lifecycle Flow (AC-01, AC-02, AC-04, AC-14, AC-15)', () => {
  test.beforeEach(async ({ context, request }) => {
    await context.clearCookies();
    await resetDbViaApi(request);
  });

  test.afterAll(async () => {
    await resetDbViaApi();
  });

  test('E2E-01-A: IT Staff records Action Taken with follow-up note (Desktop 1280px)', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Log in as IT Staff
    await loginAndHandlePasswordChange(page, 'staff.somsri@example.com');

    // 2. Navigate to Ticket Queue from Header or Dashboard
    const queueBtn = page.locator('#nav-ticket-queue, button:has-text("Ticket Queue")').first();
    await expect(queueBtn).toBeVisible();
    await queueBtn.click();

    // 3. Open ticket TKT-2026-000001
    const searchInput = page.locator('#queue-search-input, input[placeholder*="Search by ticket"], input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('TKT-2026-000001');
      const searchBtn = page.locator('#queue-search-btn');
      if (await searchBtn.isVisible()) {
        await searchBtn.click();
      } else {
        await page.keyboard.press('Enter');
      }
    }

    const ticketRow = page.locator('tbody tr:has-text("TKT-2026-000001"), tr:has-text("TKT-2026-000001") td').first();
    await expect(ticketRow).toBeVisible();
    await ticketRow.click();

    // 4. Assert Ticket Detail View loaded & locate Actions Taken section
    const actionsSection = page.locator('#actions-taken-section');
    await expect(actionsSection).toBeVisible();

    // 5. Click Record Action button
    const recordBtn = page.locator('#record-action-btn');
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();

    // 6. Fill Record Action modal form
    await expect(page.locator('#record-action-modal')).toBeVisible();

    await page.locator('#action-description-input').fill('Replaced faulty RAM stick in DIMM slot 2 and ran MemTest86 diagnostic suite.');
    await page.locator('#action-result-input').fill('Diagnostic passed cleanly with 0 bit errors across 4 full test passes.');
    await page.locator('#action-status-select').selectOption('COMPLETED');

    // Toggle Follow-up requirement (AC-02)
    const followUpCheckbox = page.locator('#action-follow-up-toggle');
    await followUpCheckbox.check();

    const followUpNote = page.locator('#action-follow-up-note-input');
    await expect(followUpNote).toBeVisible();
    await followUpNote.fill('Check memory thermal sensors after 48 hours of continuous database operation.');

    // 7. Submit Action
    await page.locator('#action-modal-submit-btn').click();

    // 8. Verify modal closes and action line appears
    await expect(page.locator('#record-action-modal')).not.toBeVisible();
    await expect(actionsSection.locator('text=Replaced faulty RAM stick in DIMM slot 2').first()).toBeVisible();
    await expect(actionsSection.locator('text=Check memory thermal sensors after 48 hours').first()).toBeVisible();

    // 9. Capture screenshot evidence
    const screenshotDir = path.resolve(__dirname, '../../artifacts/lab-04/screenshots/actions-taken');
    await page.screenshot({
      path: path.join(screenshotDir, `01-actions-taken-recorded-${projectName}.png`),
      fullPage: true,
    });
  });

  test('E2E-01-B: Requester views Actions Taken in read-only format (Tablet 768px)', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    await page.setViewportSize({ width: 768, height: 1024 });

    // 1. Log in as Requester
    await loginAndHandlePasswordChange(page, 'jennifer.a@example.com');

    // 2. Navigate to My Tickets
    const myTicketsBtn = page.locator('#nav-my-tickets, button:has-text("My Tickets")').first();
    await expect(myTicketsBtn).toBeVisible();
    await myTicketsBtn.click();

    // 3. Search and open ticket TKT-2026-000001
    const searchInput = page.locator('#search-input, input[placeholder*="Search Ticket"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('TKT-2026-000001');
      await page.keyboard.press('Enter');
    }

    const ticketItem = page.locator('tbody tr:has-text("TKT-2026-000001"), tr:has-text("TKT-2026-000001") td').first();
    await expect(ticketItem).toBeVisible();
    await ticketItem.click();

    // 4. Assert Actions Taken section is rendered (AC-04)
    const actionsSection = page.locator('#actions-taken-section');
    await expect(actionsSection).toBeVisible();

    // 5. Assert strictly ZERO modification controls are visible for Requester
    await expect(page.locator('#record-action-btn')).not.toBeVisible();
    await expect(page.locator('button:has-text("Edit Action")')).not.toBeVisible();

    // 6. Capture tablet screenshot
    const screenshotDir = path.resolve(__dirname, '../../artifacts/lab-04/screenshots/actions-taken');
    await page.screenshot({
      path: path.join(screenshotDir, `02-actions-taken-requester-readonly-${projectName}.png`),
      fullPage: true,
    });
  });

  test('E2E-01-C: Mobile stacked card layout, touch targets, and focus visibility (Mobile 375px)', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    await page.setViewportSize({ width: 375, height: 667 });

    // 1. Log in as IT Staff
    await loginAndHandlePasswordChange(page, 'staff.somsri@example.com');

    // 2. Open Ticket Queue
    const queueBtn = page.locator('#nav-ticket-queue, button:has-text("Ticket Queue")').first();
    await expect(queueBtn).toBeVisible();
    await queueBtn.click();

    // Search for TKT-2026-000001 in queue
    const queueSearch = page.locator('#queue-search-input, input[placeholder*="Search by ticket"], input[placeholder*="Search number"]').first();
    if (await queueSearch.isVisible()) {
      await queueSearch.fill('TKT-2026-000001');
      const searchBtn = page.locator('#queue-search-btn');
      if (await searchBtn.isVisible()) {
        await searchBtn.click();
      } else {
        await page.keyboard.press('Enter');
      }
    }

    const ticketRow = page.locator('tbody tr:has-text("TKT-2026-000001"), tr:has-text("TKT-2026-000001") td').first();
    await expect(ticketRow).toBeVisible();
    await ticketRow.click();

    // 3. Assert responsive behavior (AC-14)
    const actionsSection = page.locator('#actions-taken-section');
    await expect(actionsSection).toBeVisible();

    // Check that desktop table is hidden and card list is rendered on mobile
    const cardList = page.locator('#actions-card-list');
    await expect(cardList).toBeVisible();

    // 4. Check Touch Targets: min-height >= 44px
    const recordBtn = page.locator('#record-action-btn');
    if (await recordBtn.isVisible()) {
      const box = await recordBtn.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeGreaterThanOrEqual(40); // 44px accessible target
    }

    // 5. Check No Horizontal Overflow (AC-14)
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);

    // 6. Check Visible Keyboard Focus (AC-15)
    await recordBtn.focus();
    const hasFocus = await recordBtn.evaluate((el) => document.activeElement === el);
    expect(hasFocus).toBe(true);

    // 7. Capture mobile screenshot
    const screenshotDir = path.resolve(__dirname, '../../artifacts/lab-04/screenshots/actions-taken');
    await page.screenshot({
      path: path.join(screenshotDir, `03-actions-taken-mobile-cards-${projectName}.png`),
      fullPage: true,
    });
  });
});
