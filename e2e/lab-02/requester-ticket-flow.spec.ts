import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Lab 2 Requester Ticket Flow E2E & Visual Screenshot Suite', () => {
  const screenshotsBase = path.join(process.cwd(), 'artifacts', 'lab-02', 'screenshots');

  test.beforeAll(() => {
    ['create-ticket', 'my-tickets', 'ticket-detail'].forEach((dir) => {
      const fullPath = path.join(screenshotsBase, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  });

  async function ensureRequesterSelected(page: any) {
    await page.goto('/');
    const select = page.locator('select');
    if (await select.isVisible({ timeout: 2000 }).catch(() => false)) {
      await select.selectOption({ index: 1 });
      const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Confirm")').first();
      if (await continueBtn.isVisible().catch(() => false)) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }
  }

  test('1. Development Requester Selector & Create Ticket Workflow Screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Capture Requester Selection Screen
    await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'requester-selector.png') });

    await ensureRequesterSelected(page);

    // Capture Create Ticket Initial Desktop Screen
    const createNav = page.locator('button:has-text("Create Ticket"), a:has-text("Create Ticket")').first();
    if (await createNav.isVisible().catch(() => false)) {
      await createNav.click({ force: true });
    }
    await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'create-ticket-initial-desktop.png') });

    // Trigger Validation Error (submit empty form)
    const submitBtn = page.locator('button[type="submit"], button:has-text("Submit Ticket")').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'create-ticket-validation-error.png') });
    }

    // Fill valid ticket details
    const summaryInput = page.locator('input[name="summary"], input#summary').first();
    if (await summaryInput.isVisible().catch(() => false)) {
      await summaryInput.fill('VPN Connection Timeout Issue');
    }
    const descriptionInput = page.locator('textarea[name="description"], textarea#description').first();
    if (await descriptionInput.isVisible().catch(() => false)) {
      await descriptionInput.fill('Cannot connect to corporate VPN when working remotely from home network.');
    }

    // Submit valid ticket
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'create-ticket-success-state.png') });
    }

    // Capture Mobile Viewport for Create Ticket
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'create-ticket-mobile.png') });
  });

  test('2. My Tickets Screen Screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await ensureRequesterSelected(page);

    const myTicketsNav = page.locator('button:has-text("My Tickets"), a:has-text("My Tickets")').first();
    if (await myTicketsNav.isVisible().catch(() => false)) {
      await myTicketsNav.click({ force: true });
    }

    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsBase, 'my-tickets', 'my-tickets-desktop.png') });

    // Filter/Search screenshot
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('VPN');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsBase, 'my-tickets', 'my-tickets-search-filter.png') });
    }

    // Mobile Viewport screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: path.join(screenshotsBase, 'my-tickets', 'my-tickets-mobile.png') });
  });

  test('3. Ticket Detail & Attachments Screen Screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await ensureRequesterSelected(page);

    const myTicketsNav = page.locator('button:has-text("My Tickets"), a:has-text("My Tickets")').first();
    if (await myTicketsNav.isVisible().catch(() => false)) {
      await myTicketsNav.click({ force: true });
    }

    // Open first ticket detail
    const ticketLink = page.locator('table tbody tr, .ticket-card, td:has-text("TKT-")').first();
    if (await ticketLink.isVisible().catch(() => false)) {
      await ticketLink.click({ force: true });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsBase, 'ticket-detail', 'ticket-detail-desktop.png') });

      // Attachments section screenshot
      const attachmentsSection = page.locator('text=Attachments, section:has-text("Attachments")').first();
      if (await attachmentsSection.isVisible().catch(() => false)) {
        await page.screenshot({ path: path.join(screenshotsBase, 'ticket-detail', 'ticket-detail-attachments.png') });
      }
    }
  });
});
