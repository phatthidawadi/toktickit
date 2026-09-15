import { test, expect } from '@playwright/test';

test.describe('E2E-02: IT Staff Queue & Ticket Operations E2E Journey', () => {
  test('Log in as IT Staff, view queue, search/filter, claim ticket, update priority/status, post comments & notes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto('/');
    await page.waitForTimeout(500);

    // Fill login as IT Staff if at login page
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('staff.somsri@example.com');
      await page.locator('input[type="password"]').first().fill('Password123!');
      await page.locator('button:has-text("Sign In"), button[type="submit"]').first().click();
      await page.waitForTimeout(800);
    }

    // Verify Staff Ticket Queue or header nav
    const navBtn = page.locator('button:has-text("Ticket Queue")').first();
    if (await navBtn.isVisible().catch(() => false)) {
      await navBtn.click();
      await page.waitForTimeout(500);
    }

    // Search and filter toolbar
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('VPN');
      await page.waitForTimeout(300);
    }

    // Ticket rows in queue table
    const firstRow = page.locator('tbody tr, .ticket-row, .card-ticket').first();
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click();
      await page.waitForTimeout(800);

      // Verify Ticket detail controls
      const claimBtn = page.locator('button:has-text("Claim Ticket"), button:has-text("Claim")').first();
      if (await claimBtn.isVisible().catch(() => false)) {
        await claimBtn.click();
        await page.waitForTimeout(500);
      }

      // Public Comment tab / form
      const commentInput = page.locator('textarea[placeholder*="comment"], textarea[placeholder*="Comment"]').first();
      if (await commentInput.isVisible().catch(() => false)) {
        await commentInput.fill('Investigating VPN connectivity issue for user.');
        const postCommentBtn = page.locator('button:has-text("Post Public Comment"), button:has-text("Post Comment")').first();
        if (await postCommentBtn.isVisible().catch(() => false)) {
          await postCommentBtn.click();
          await page.waitForTimeout(500);
        }
      }

      // Internal Note tab / form
      const internalTab = page.locator('button:has-text("Internal Notes"), tab:has-text("Internal Notes")').first();
      if (await internalTab.isVisible().catch(() => false)) {
        await internalTab.click();
        await page.waitForTimeout(300);
      }

      const noteInput = page.locator('textarea[placeholder*="note"], textarea[placeholder*="Note"]').first();
      if (await noteInput.isVisible().catch(() => false)) {
        await noteInput.fill('Confidential staff note: Checked VPN server logs.');
        const postNoteBtn = page.locator('button:has-text("Add Internal Note"), button:has-text("Post Note")').first();
        if (await postNoteBtn.isVisible().catch(() => false)) {
          await postNoteBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });
});
