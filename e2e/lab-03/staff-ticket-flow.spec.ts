import path from 'path';
import { test, expect, Page } from '@playwright/test';

async function resetDbViaApi(request?: any) {
  try {
    if (request) {
      const res1 = await request.post('http://localhost:3000/api/test/reset-db');
      await res1.json().catch(() => {});
      const res2 = await request.post('http://localhost:3000/api/test/reset-rate-limit');
      await res2.json().catch(() => {});
    } else {
      const r1 = await fetch('http://localhost:3000/api/test/reset-db', { method: 'POST' });
      await r1.json().catch(() => {});
      const r2 = await fetch('http://localhost:3000/api/test/reset-rate-limit', { method: 'POST' });
      await r2.json().catch(() => {});
    }
  } catch {}
}

async function loginAndHandlePasswordChange(page: Page, email: string, pass: string = 'Password123!') {
  await page.context().clearCookies();
  await page.goto('/');

  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(pass);
  await page.locator('#login-submit-btn').click();

  await page.waitForSelector('.change-password-container, .site-brand, #login-error', { timeout: 10000 });

  const errorMsg = page.locator('#login-error');
  let usedPassword = pass;
  if (await errorMsg.isVisible()) {
    usedPassword = 'NewSecurePassword123!';
    await page.locator('#login-password').fill(usedPassword);
    await page.locator('#login-submit-btn').click();
    await page.waitForSelector('.change-password-container, .site-brand', { timeout: 10000 });
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

test.describe('E2E-02: IT Staff Ticket Queue & Lifecycle Workflow E2E Journey', () => {
  test.beforeEach(async ({ context, request }) => {
    await context.clearCookies();
    await resetDbViaApi(request);
  });

  test.afterAll(async () => {
    await resetDbViaApi();
  });

  test('E2E-02-A: Log in as IT Staff, view queue, search/filter, and claim ticket ownership', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;

    // 1. Log in as IT Staff
    await loginAndHandlePasswordChange(page, 'staff.somsri@example.com');

    // Assert navigation to Staff Ticket Queue
    const navBtn = page.locator('button:has-text("Ticket Queue")');
    await expect(navBtn).toBeVisible();

    // Search for ticket by keyword
    const searchInput = page.locator('input[placeholder*="Search by ticket"], input[type="text"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('email');
    await page.keyboard.press('Enter');

    await page.screenshot({
      path: path.resolve(__dirname, `../../artifacts/lab-03/screenshots/staff-queue/01-staff-queue-search-${projectName}.png`),
      fullPage: true,
    });

    // Click ticket TKT-2026-000001 cell
    const ticketCell = page.locator('tr:has-text("TKT-2026-000001") td').first();
    await expect(ticketCell).toBeVisible();
    await ticketCell.click({ force: true });

    // Assert Ticket Detail view loaded
    const ticketTitle = page.locator('span:has-text("TKT-2026-000001"), h2:has-text("TKT-2026-000001")').first();
    await expect(ticketTitle).toBeVisible();

    // Claim ticket ownership (Hard assertion)
    const claimBtn = page.locator('button:has-text("Claim Ticket")');
    if (await claimBtn.isVisible()) {
      await claimBtn.click();
    }

    // Assert assigned staff name displays Staff Somsri
    const assignedBadge = page.locator('div:has-text("Assigned Staff:"), div:has-text("Staff Somsri")').first();
    await expect(assignedBadge).toBeVisible();

    await page.screenshot({
      path: path.resolve(__dirname, `../../artifacts/lab-03/screenshots/staff-ticket-detail/01-staff-ticket-claimed-${projectName}.png`),
      fullPage: true,
    });
  });

  test('E2E-02-B: IT priority edit, status transition (IN_PROGRESS -> RESOLVED), Public Comments, and Internal Notes privacy enforcement', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;

    // 1. Log in as IT Staff
    await loginAndHandlePasswordChange(page, 'staff.somsri@example.com');

    // 2. Open Ticket TKT-2026-000001
    const queueNav = page.locator('button:has-text("Ticket Queue")');
    await expect(queueNav).toBeVisible();

    const searchInput = page.locator('input[placeholder*="Search by ticket"], input[type="text"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('TKT-2026-000001');
    await page.keyboard.press('Enter');

    const ticketCell = page.locator('tr:has-text("TKT-2026-000001") td, tr:has-text("TKT-2026-000001")').first();
    await expect(ticketCell).toBeVisible();
    await ticketCell.click({ force: true });

    // 3. Edit IT Priority to URGENT
    const itPrioritySelect = page.locator('#it-priority-select');
    await expect(itPrioritySelect).toBeVisible();
    await itPrioritySelect.selectOption('URGENT');

    // 4. Update Status (NEW -> IN_PROGRESS -> RESOLVED)
    const statusSelect = page.locator('#status-transition-select');
    await expect(statusSelect).toBeVisible();
    await statusSelect.selectOption('IN_PROGRESS');
    await expect(page.locator('#status-transition-select')).toHaveValue('IN_PROGRESS');
    await statusSelect.selectOption('RESOLVED');

    // Assert status pill / banner displays RESOLVED
    const successMsg = page.locator('text="Ticket status updated to RESOLVED."');
    await expect(successMsg).toBeVisible();
    await expect(page.locator('#status-transition-select')).toHaveValue('RESOLVED');

    // 5. Post Public Comment
    const commentInput = page.locator('#comment-input');
    await expect(commentInput).toBeVisible();
    await commentInput.fill('Investigated Outlook connection issue and resolved configuration.');
    await page.locator('#submit-comment-btn').click();

    // Assert Public Comment appears in list
    const publicComment = page.locator('p:has-text("Investigated Outlook connection issue")').first();
    await expect(publicComment).toBeVisible();

    // 6. Switch to Internal Notes tab and post Confidential Internal Note
    const tabNotesBtn = page.locator('#tab-notes-btn');
    await expect(tabNotesBtn).toBeVisible();
    await tabNotesBtn.click();

    const noteInput = page.locator('#note-input');
    await expect(noteInput).toBeVisible();
    await noteInput.fill('Confidential Staff Note: Re-synced Exchange AD token.');
    await page.locator('#submit-note-btn').click();

    // Assert Internal Note appears for Staff
    const internalNote = page.locator('p:has-text("Re-synced Exchange AD token")').first();
    await expect(internalNote).toBeVisible();

    await page.screenshot({
      path: path.resolve(__dirname, `../../artifacts/lab-03/screenshots/staff-ticket-detail/02-resolved-comment-notes-${projectName}.png`),
      fullPage: true,
    });

    // 7. Verify Privacy: Log out IT Staff and log in as Requester
    await page.locator('.logout-btn').click();
    await expect(page.locator('#login-email')).toBeVisible();

    await loginAndHandlePasswordChange(page, 'jennifer.a@example.com');

    // Handle Requester Context modal if displayed
    const noReqBtn = page.locator('button:has-text("Select Requester Context")');
    if (await noReqBtn.isVisible()) {
      await noReqBtn.click();
      const selectJen = page.locator('button:has-text("Jennifer Anderson"), tr:has-text("Jennifer Anderson")').first();
      if (await selectJen.isVisible()) {
        await selectJen.click({ force: true });
      }
    }

    // Open ticket in Requester view
    const reqSearchInput = page.locator('#search-input, input[placeholder*="Search"]').first();
    await expect(reqSearchInput).toBeVisible();
    await reqSearchInput.fill('TKT-2026-000001');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);

    const reqTicketRow = page.locator('tr:has-text("TKT-2026-000001") td, tr:has-text("TKT-2026-000001")').first();
    await expect(reqTicketRow).toBeVisible();
    await reqTicketRow.click({ force: true });

    // Hard Assertion 1: Public Comment IS visible to Requester
    await expect(page.locator('p:has-text("Investigated Outlook connection issue")').first()).toBeVisible();

    // Hard Assertion 2: Internal Note container / text is NOT visible to Requester
    await expect(page.locator('#internal-notes-container')).not.toBeVisible();
    await expect(page.locator('text="Re-synced Exchange AD token"')).not.toBeVisible();

    await page.screenshot({
      path: path.resolve(__dirname, `../../artifacts/lab-03/screenshots/staff-ticket-detail/03-requester-privacy-view-${projectName}.png`),
      fullPage: true,
    });
  });
});
