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

test.describe('E2E-02: Ticket Resolution Gate & Status Lifecycle (AC-06, AC-07, AC-08, AC-09)', () => {
  test.beforeEach(async ({ context, request }) => {
    await context.clearCookies();
    await resetDbViaApi(request);
  });

  test.afterAll(async () => {
    await resetDbViaApi();
  });

  test('E2E-02-A: Requester advisory resolution acknowledgment -> Staff formal verification and RESOLVED transition (Desktop 1280px)', async ({ page, context }, testInfo) => {
    const projectName = testInfo.project.name;
    await page.setViewportSize({ width: 1280, height: 800 });

    // --- PHASE 1: Requester indicates Problem Appears Resolved (AC-06) ---
    await loginAndHandlePasswordChange(page, 'jennifer.a@example.com');

    // Navigate to My Tickets
    const myTicketsBtn = page.locator('#nav-my-tickets, button:has-text("My Tickets")').first();
    await expect(myTicketsBtn).toBeVisible();
    await myTicketsBtn.click();

    // Search and open ticket TKT-2026-000001
    const searchInput = page.locator('#search-input, input[placeholder*="Search Ticket"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('TKT-2026-000001');
      await page.keyboard.press('Enter');
    }

    const ticketRow = page.locator('tr:has-text("TKT-2026-000001"), td:has-text("TKT-2026-000001")').first();
    await expect(ticketRow).toBeVisible();
    await ticketRow.click({ force: true });

    // Toggle Problem Appears Resolved
    const resolveAckCheckbox = page.locator('#resolve-ack-toggle');
    await expect(resolveAckCheckbox).toBeVisible();
    await resolveAckCheckbox.click();

    // Verify checkbox state
    await expect(resolveAckCheckbox).toBeChecked();

    // Verify current status is NOT changed to RESOLVED (BR-06: Authoritative Resolution Gate)
    const statusBadge = page.locator('#ticket-status-badge, .status-pill, span:has-text("OPEN"), span:has-text("IN_PROGRESS"), span:has-text("IN PROGRESS")').first();
    await expect(statusBadge).toBeVisible();
    const statusText = await statusBadge.innerText();
    expect(statusText).not.toContain('RESOLVED');

    // Screenshot Requester advisory acknowledgment
    const screenshotDir = path.resolve(__dirname, '../../artifacts/lab-04/screenshots/ticket-resolution');
    await page.screenshot({
      path: path.join(screenshotDir, `01-requester-advisory-ack-${projectName}.png`),
      fullPage: true,
    });

    // --- PHASE 2: IT Staff verifies advisory banner & formally transitions to RESOLVED (AC-07) ---
    await context.clearCookies();
    await loginAndHandlePasswordChange(page, 'staff.somsri@example.com');

    // Navigate to Staff Ticket Queue
    const queueBtn = page.locator('#nav-ticket-queue, button:has-text("Ticket Queue")').first();
    await expect(queueBtn).toBeVisible();
    await queueBtn.click();

    // Search and open ticket TKT-2026-000001
    const staffSearch = page.locator('#queue-search-input, input[placeholder*="Search by ticket"], input[placeholder*="Search number"]').first();
    if (await staffSearch.isVisible()) {
      await staffSearch.fill('TKT-2026-000001');
      await page.keyboard.press('Enter');
    }

    const staffTicketRow = page.locator('tr:has-text("TKT-2026-000001"), td:has-text("TKT-2026-000001")').first();
    await expect(staffTicketRow).toBeVisible();
    await staffTicketRow.click({ force: true });

    // Assert Advisory Resolution Banner is prominently rendered
    const advisoryBanner = page.locator('#advisory-resolution-banner');
    await expect(advisoryBanner).toBeVisible();
    await expect(advisoryBanner).toContainText('Requester indicated the problem appears resolved');

    // Claim ticket if needed
    const claimBtn = page.locator('#claim-ticket-btn');
    if (await claimBtn.isVisible()) {
      await claimBtn.click();
    }

    // Move to IN_PROGRESS first if current status is NEW or OPEN
    const statusSelect = page.locator('#status-transition-select');
    await expect(statusSelect).toBeVisible();

    const currentVal = await statusSelect.inputValue();
    if (currentVal !== 'IN_PROGRESS' && currentVal !== 'WAITING_FOR_REQUESTER') {
      await statusSelect.selectOption('IN_PROGRESS');
      await page.waitForTimeout(500);
    }

    // Now transition to RESOLVED per BR-10 resolution gate
    await statusSelect.selectOption('RESOLVED');

    // Verify status updated successfully
    await expect(page.locator('text=Ticket status updated to RESOLVED.').or(page.locator('span:has-text("RESOLVED")').first())).toBeVisible();

    // Screenshot Staff resolution
    await page.screenshot({
      path: path.join(screenshotDir, `02-staff-formally-resolved-${projectName}.png`),
      fullPage: true,
    });
  });

  test('E2E-02-B: Transition Matrix enforcement & 409 Optimistic Concurrency Conflict handling (Desktop 1280px)', async ({ page, request }, testInfo) => {
    const projectName = testInfo.project.name;
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Log in as IT Staff
    await loginAndHandlePasswordChange(page, 'staff.somsri@example.com');

    // 2. Open Ticket Queue and open TKT-2026-000002 (NEW status)
    const queueBtn = page.locator('#nav-ticket-queue, button:has-text("Ticket Queue")').first();
    await expect(queueBtn).toBeVisible();
    await queueBtn.click();

    // Search for TKT-2026-000002
    const searchTkt2 = page.locator('#queue-search-input, input[placeholder*="Search by ticket"], input[placeholder*="Search number"]').first();
    if (await searchTkt2.isVisible()) {
      await searchTkt2.fill('TKT-2026-000002');
      await page.keyboard.press('Enter');
    }

    const ticketRow = page.locator('tr:has-text("TKT-2026-000002"), td:has-text("TKT-2026-000002")').first();
    await expect(ticketRow).toBeVisible();
    await ticketRow.click({ force: true });

    // 3. Verify permitted transition matrix for NEW (AC-08):
    // From NEW, only OPEN and CANCELLED are valid. RESOLVED must NOT be selectable directly!
    const statusSelect = page.locator('#status-transition-select');
    await expect(statusSelect).toBeVisible();

    const options = await statusSelect.locator('option').allInnerTexts();
    const joinedOptions = options.join(' ');
    // Direct bypass from NEW to RESOLVED is forbidden
    expect(joinedOptions).not.toContain('Transition to RESOLVED');

    // 4. Test 409 Optimistic Concurrency Conflict (AC-09) on Actions Taken
    // Open record action modal
    const recordBtn = page.locator('#record-action-btn');
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();

    await page.locator('#action-description-input').fill('Primary diagnostics applied to workstation network card.');
    await page.locator('#action-result-input').fill('Initial ping tests returned 0% packet loss.');
    await page.locator('#action-modal-submit-btn').click();

    await expect(page.locator('#record-action-modal')).not.toBeVisible();

    // Now edit the created action
    const editBtn = page.locator('button[id^="edit-action-btn-"], button:has-text("Edit"):visible').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    await expect(page.locator('#edit-action-modal')).toBeVisible();

    // Simulate concurrent modification in backend by triggering an out-of-band update
    // Login as admin via API and update this action line to increment its version
    let baseUrl = 'http://127.0.0.1:3000';
    let adminLoginRes = await request.post(`${baseUrl}/api/auth/login`, {
      data: { email: 'admin.toktickit@example.com', password: 'Password123!' },
    });
    if (!adminLoginRes.ok()) {
      adminLoginRes = await request.post(`${baseUrl}/api/auth/login`, {
        data: { email: 'admin.toktickit@example.com', password: 'NewSecurePassword456!' },
      });
    }
    const cookies = adminLoginRes.headers()['set-cookie'] || '';

    // Find the action ID from client or fetch actions API
    const actionsRes = await request.get(`${baseUrl}/api/tickets/2/actions`, {
      headers: { cookie: cookies },
    });
    const actionsData = await actionsRes.json();
    if (actionsData && actionsData.length > 0) {
      const targetAction = actionsData[actionsData.length - 1];

      // Mutate the action in the database to increment version
      await request.patch(`${baseUrl}/api/actions/${targetAction.id}`, {
        headers: { cookie: cookies },
        data: {
          description: 'Concurrent modification from another technician session',
          result: 'Updated out-of-band',
          status: 'COMPLETED',
          version: targetAction.version,
        },
      });

      // Now user clicks save on the modal with stale version
      await page.locator('#edit-action-description-input').fill('My conflicting edit attempt');
      await page.locator('#edit-action-submit-btn').click();

      // Assert 409 Concurrency Conflict banner is displayed (AC-09)
      const conflictBanner = page.locator('#concurrency-conflict-banner, text=modified by another technician');
      await expect(conflictBanner).toBeVisible();

      // Screenshot conflict alert banner
      const screenshotDir = path.resolve(__dirname, '../../artifacts/lab-04/screenshots/ticket-resolution');
      await page.screenshot({
        path: path.join(screenshotDir, `03-concurrency-conflict-alert-${projectName}.png`),
        fullPage: true,
      });
    }
  });
});
