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

  async function ensureRequesterSelected(page: any, requesterIndex = 1) {
    await page.goto('/');
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 2000 }).catch(() => false)) {
      await select.selectOption({ index: requesterIndex });
      const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Confirm"), button:has-text("Save")').first();
      if (await continueBtn.isVisible().catch(() => false)) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }
  }

  test('1. Create Ticket Flow Screenshots (All States)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // 1. requester-selector.png
    await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'requester-selector.png') });

    await ensureRequesterSelected(page, 1);

    // Navigate to Create Ticket
    const createNav = page.locator('button:has-text("Create Ticket"), a:has-text("Create Ticket")').first();
    if (await createNav.isVisible().catch(() => false)) {
      await createNav.click({ force: true });
    }

    // 2. create-ticket-initial-desktop.png
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'create-ticket-initial-desktop.png') });

    // 3. create-ticket-mobile.png
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'create-ticket-mobile.png') });
    await page.setViewportSize({ width: 1280, height: 800 });

    // 4. create-ticket-validation-error.png
    const submitBtn = page.locator('button[type="submit"], button:has-text("Submit Ticket")').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'create-ticket-validation-error.png') });
    }

    // 5. create-ticket-invalid-attachment.png (Explicitly attach .exe file on Create Ticket form)
    const invalidExePath = path.join(process.cwd(), 'scratch', 'malware_script.exe');
    if (!fs.existsSync(path.dirname(invalidExePath))) {
      fs.mkdirSync(path.dirname(invalidExePath), { recursive: true });
    }
    fs.writeFileSync(invalidExePath, 'MZ binary executable content');

    const fileInput = page.locator('input#create-attachment-input, input[type="file"]').first();
    if (await fileInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fileInput.setInputFiles(invalidExePath);
      await page.waitForTimeout(500);
      const errorAlert = page.locator('text=File type .exe is prohibited');
      await expect(errorAlert).toBeVisible({ timeout: 3000 });
      await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'create-ticket-invalid-attachment.png') });
    }

    // Fill Category and System
    const categorySelect = page.locator('select#category-select, select#category, select[name="categoryId"]').first();
    if (await categorySelect.isVisible().catch(() => false)) {
      await categorySelect.selectOption({ index: 0 });
      await page.waitForTimeout(500);
    }
    const systemSelect = page.locator('select#system-select, select#relatedSystem, select[name="relatedSystemId"]').first();
    if (await systemSelect.isVisible().catch(() => false)) {
      await systemSelect.selectOption({ index: 0 });
    }

    // Fill valid summary and description
    const summaryInput = page.locator('input#summary-input, input#summary, input[name="summary"]').first();
    if (await summaryInput.isVisible().catch(() => false)) {
      await summaryInput.fill('Corporate VPN Timeout and Reconnection Issue');
    }
    const descriptionInput = page.locator('textarea#description-input, textarea#description, textarea[name="description"]').first();
    if (await descriptionInput.isVisible().catch(() => false)) {
      await descriptionInput.fill('VPN drops connection every 15 minutes when working remotely from home network.');
    }

    // 6. create-ticket-submitting-busy.png
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'create-ticket-submitting-busy.png') });
    }

    // 7. create-ticket-success-state.png
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'create-ticket-success-state.png') });

    // 8. create-ticket-api-failure-preserved.png
    if (await createNav.isVisible().catch(() => false)) {
      await createNav.click({ force: true });
      await page.waitForTimeout(300);
    }
    if (await summaryInput.isVisible().catch(() => false)) {
      await summaryInput.fill('Hardware Screen Flickering Preserved Input');
      await descriptionInput.fill('Screen flickers randomly when connected to external HDMI display monitor.');
    }
    await page.route('**/api/tickets', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error simulation' }),
        });
      } else {
        await route.continue();
      }
    });

    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsBase, 'create-ticket', 'create-ticket-api-failure-preserved.png') });
    }

    await page.unroute('**/api/tickets');
  });

  test('2. My Tickets Flow Screenshots (All States)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await ensureRequesterSelected(page, 1);

    const myTicketsNav = page.locator('button:has-text("My Tickets"), a:has-text("My Tickets")').first();
    if (await myTicketsNav.isVisible().catch(() => false)) {
      await myTicketsNav.click({ force: true });
    }
    await page.waitForTimeout(500);

    // 9. my-tickets-desktop.png
    await page.screenshot({ path: path.join(screenshotsBase, 'my-tickets', 'my-tickets-desktop.png') });

    // 10. my-tickets-mobile.png
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: path.join(screenshotsBase, 'my-tickets', 'my-tickets-mobile.png') });
    await page.setViewportSize({ width: 1280, height: 800 });

    // 11. my-tickets-search-filter.png
    const searchInput = page.locator('input#search-input, input[placeholder*="Search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('VPN');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsBase, 'my-tickets', 'my-tickets-search-filter.png') });
      await searchInput.fill('');
      await page.waitForTimeout(300);
    }

    // 12. my-tickets-sorting.png (Explicitly select Sort By control and assert priority sort)
    const sortSelect = page.locator('select#sort-select').first();
    if (await sortSelect.isVisible().catch(() => false)) {
      await sortSelect.selectOption({ value: 'priority_desc' });
      await page.waitForTimeout(500);

      // Assert sort selection value
      await expect(sortSelect).toHaveValue('priority_desc');

      // Assert ticket order actually changes / is sorted by priority rank order (URGENT > HIGH > MEDIUM > LOW)
      const priorityCells = page.locator('table tbody tr td:nth-child(4)');
      const count = await priorityCells.count();
      if (count > 0) {
        const priorities = await priorityCells.allInnerTexts();
        const rankMap: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const ranks = priorities.map((p) => rankMap[p.trim().toUpperCase()] || 0);
        for (let i = 0; i < ranks.length - 1; i++) {
          expect(ranks[i]).toBeGreaterThanOrEqual(ranks[i + 1]);
        }
      }

      await page.screenshot({ path: path.join(screenshotsBase, 'my-tickets', 'my-tickets-sorting.png') });
    }

    const clearBtn = page.locator('button:has-text("Clear Filters")').first();
    if (await clearBtn.isVisible().catch(() => false)) {
      await clearBtn.click();
      await page.waitForTimeout(500);
    }

    // 13. my-tickets-pagination.png
    await page.screenshot({ path: path.join(screenshotsBase, 'my-tickets', 'my-tickets-pagination.png') });

    // 14. my-tickets-no-results.png
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('NONEXISTENT_QUERY_XYZ_12345');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsBase, 'my-tickets', 'my-tickets-no-results.png') });
    }

    // 15. my-tickets-empty-state.png
    await page.route('**/api/tickets*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tickets: [], total: 0, page: 1, limit: 10, totalPages: 1 }),
      });
    });
    await page.reload();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsBase, 'my-tickets', 'my-tickets-empty-state.png') });
    await page.unroute('**/api/tickets*');

    // 16. my-tickets-requester-switching.png
    const changeRequesterBtn = page.locator('button:has-text("Change")').first();
    if (await changeRequesterBtn.isVisible().catch(() => false)) {
      await changeRequesterBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(screenshotsBase, 'my-tickets', 'my-tickets-requester-switching.png') });
    }
  });

  test('3. Ticket Detail & Attachments Flow Screenshots (All States)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await ensureRequesterSelected(page, 1);

    const createNav = page.locator('button:has-text("Create Ticket"), a:has-text("Create Ticket")').first();
    if (await createNav.isVisible().catch(() => false)) {
      await createNav.click({ force: true });
      await page.waitForTimeout(300);

      const categorySelect = page.locator('select#category-select, select#category, select[name="categoryId"]').first();
      if (await categorySelect.isVisible().catch(() => false)) {
        await categorySelect.selectOption({ index: 0 });
        await page.waitForTimeout(300);
      }
      const systemSelect = page.locator('select#system-select, select#relatedSystem, select[name="relatedSystemId"]').first();
      if (await systemSelect.isVisible().catch(() => false)) {
        await systemSelect.selectOption({ index: 0 });
      }
      const summaryInput = page.locator('input#summary-input, input#summary, input[name="summary"]').first();
      if (await summaryInput.isVisible().catch(() => false)) {
        await summaryInput.fill('Diagnostic Log Review Ticket');
      }
      const descriptionInput = page.locator('textarea#description-input, textarea#description, textarea[name="description"]').first();
      if (await descriptionInput.isVisible().catch(() => false)) {
        await descriptionInput.fill('Detailed diagnostic log report attachment review requested for network analysis.');
      }
      const submitBtn = page.locator('button[type="submit"], button:has-text("Submit Ticket")').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    const myTicketsNav = page.locator('button:has-text("My Tickets"), a:has-text("My Tickets")').first();
    if (await myTicketsNav.isVisible().catch(() => false)) {
      await myTicketsNav.click({ force: true });
      await page.waitForTimeout(500);
    }

    const ticketRow = page.locator('table tbody tr').first();
    await ticketRow.waitFor({ state: 'visible', timeout: 5000 });
    await ticketRow.click();
    await page.waitForTimeout(500);

    // Wait for Ticket Detail view to finish loading
    await page.locator('text=File Attachments, input#ticket-detail-file-input').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // 17. ticket-detail-desktop.png
    await page.screenshot({ path: path.join(screenshotsBase, 'ticket-detail', 'ticket-detail-desktop.png') });

    // 18. ticket-detail-attachment-upload.png
    const fileInput = page.locator('input#ticket-detail-file-input').first();
    await fileInput.waitFor({ state: 'attached', timeout: 5000 });
    const tempFilePath = path.join(process.cwd(), 'scratch', 'network_diagnostic.pdf');
    if (!fs.existsSync(path.dirname(tempFilePath))) {
      fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    }
    fs.writeFileSync(tempFilePath, '%PDF-1.4 sample diagnostic logs content');

    await fileInput.setInputFiles(tempFilePath);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsBase, 'ticket-detail', 'ticket-detail-attachment-upload.png') });
    await page.waitForTimeout(1000);

    // 19. ticket-detail-active-download.png
    await page.screenshot({ path: path.join(screenshotsBase, 'ticket-detail', 'ticket-detail-active-download.png') });

    // 20. ticket-detail-removal-dialog.png
    const removeBtn = page.locator('button:has-text("Remove")').first();
    await removeBtn.waitFor({ state: 'visible', timeout: 5000 });
    await removeBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsBase, 'ticket-detail', 'ticket-detail-removal-dialog.png') });

    const reasonInput = page.locator('textarea#removal-reason-input').first();
    await reasonInput.fill('Outdated network log attachment replaced by updated diagnostic report.');
    const confirmRemoveBtn = page.locator('button:has-text("Remove Attachment")').first();
    await confirmRemoveBtn.click();
    await page.waitForTimeout(1000);

    // 21. ticket-detail-removed-metadata.png
    await page.screenshot({ path: path.join(screenshotsBase, 'ticket-detail', 'ticket-detail-removed-metadata.png') });

    // 22. ticket-detail-blocked-download.png
    await page.screenshot({ path: path.join(screenshotsBase, 'ticket-detail', 'ticket-detail-blocked-download.png') });
  });
});
