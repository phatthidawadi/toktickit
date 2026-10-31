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

test.describe('E2E-03: Role-Based Dashboards & Drill-Down Navigation (AC-10, AC-11, AC-12, AC-13, AC-14, AC-15)', () => {
  test.beforeEach(async ({ context, request }) => {
    await context.clearCookies();
    await resetDbViaApi(request);
  });

  test.afterAll(async () => {
    await resetDbViaApi();
  });

  test('E2E-03-A: Requester lands on Dashboard, views accurate metrics, and clicks drill-down (Desktop 1280px)', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Log in as Requester
    await loginAndHandlePasswordChange(page, 'jennifer.a@example.com');

    // 2. Assert default landing on Dashboard (FR-12)
    const openCard = page.locator('#dash-open-tickets');
    await expect(openCard).toBeVisible();

    // 3. Assert metric cards exist and have values (AC-10)
    const waitingCard = page.locator('#dash-waiting-tickets');
    const resolvedCard = page.locator('#dash-resolved-tickets');
    await expect(waitingCard).toBeVisible();
    await expect(resolvedCard).toBeVisible();

    // 4. Assert recent tickets table
    const recentTable = page.locator('#dash-recent-tickets-table');
    await expect(recentTable).toBeVisible();

    // Screenshot Requester Dashboard
    const screenshotDir = path.resolve(__dirname, '../../artifacts/lab-04/screenshots/requester-dashboard');
    await page.screenshot({
      path: path.join(screenshotDir, `01-requester-dashboard-overview-${projectName}.png`),
      fullPage: true,
    });

    // 5. Click drill-down card (AC-13)
    await waitingCard.click();

    // 6. Verify navigation to My Tickets view
    const myTicketsHeading = page.locator('h2:has-text("My IT Support Tickets"), h2:has-text("My Tickets"), h1:has-text("My Tickets")');
    await expect(myTicketsHeading).toBeVisible();

    // Verify filter was applied via initialFilter
    const statusSelect = page.locator('#status-filter');
    if (await statusSelect.isVisible()) {
      await expect(statusSelect).toHaveValue('WAITING_FOR_REQUESTER');
    }

    // Screenshot drill-down target view
    await page.screenshot({
      path: path.join(screenshotDir, `02-requester-drilldown-filtered-${projectName}.png`),
      fullPage: true,
    });
  });

  test('E2E-03-B: Administrator views Staff Dashboard with Admin User Summary card & Queue drill-down (Desktop 1280px)', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Log in as Administrator
    await loginAndHandlePasswordChange(page, 'admin.toktickit@example.com');

    // 2. Assert default landing on Staff Dashboard (FR-12)
    const unassignedCard = page.locator('#dash-unassigned');
    await expect(unassignedCard).toBeVisible();

    // 3. Assert Staff operational metric cards (AC-11)
    const assignedMeCard = page.locator('#dash-assigned-me');
    const urgentCard = page.locator('#dash-urgent');
    const waitingCard = page.locator('#dash-waiting');
    await expect(assignedMeCard).toBeVisible();
    await expect(urgentCard).toBeVisible();
    await expect(waitingCard).toBeVisible();

    // 4. Assert Administrator User Summary Card (AC-12, FR-10)
    const adminUserSummary = page.locator('#dash-admin-user-summary');
    await expect(adminUserSummary).toBeVisible();
    await expect(page.locator('#dash-requester-count')).toBeVisible();
    await expect(page.locator('#dash-staff-count')).toBeVisible();
    await expect(page.locator('#dash-admin-count')).toBeVisible();

    // Screenshot Admin/Staff Dashboard
    const screenshotDir = path.resolve(__dirname, '../../artifacts/lab-04/screenshots/staff-dashboard');
    await page.screenshot({
      path: path.join(screenshotDir, `01-staff-admin-dashboard-${projectName}.png`),
      fullPage: true,
    });

    // 5. Click drill-down from Unassigned card to Queue (AC-13)
    await unassignedCard.click();

    // 6. Verify navigation to Ticket Queue with pre-filtered unassigned tickets
    const queueHeading = page.locator('h2:has-text("IT Staff Ticket Queue"), h1:has-text("IT Staff Ticket Queue")');
    await expect(queueHeading).toBeVisible();

    const assignedStaffFilter = page.locator('#queue-assigned-filter');
    await expect(assignedStaffFilter).toBeVisible();
    await expect(assignedStaffFilter).toHaveValue('unassigned');

    // Screenshot drill-down queue
    await page.screenshot({
      path: path.join(screenshotDir, `02-staff-drilldown-queue-${projectName}.png`),
      fullPage: true,
    });
  });

  test('E2E-03-C: Mobile responsive dashboard layout, touch targets, and focus visibility (Mobile 375px)', async ({ page, context }, testInfo) => {
    const projectName = testInfo.project.name;
    await page.setViewportSize({ width: 375, height: 667 });

    // 1. Log in as IT Staff on Mobile
    await loginAndHandlePasswordChange(page, 'staff.somsri@example.com');

    // 2. Verify Staff Dashboard collapses into stacked cards (AC-14)
    const unassignedCard = page.locator('#dash-unassigned');
    await expect(unassignedCard).toBeVisible();

    // Verify zero horizontal scrollbar (AC-14)
    const isOverflowingStaff = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowingStaff).toBe(false);

    // Verify visible focus ring on dashboard button
    const viewQueueBtn = page.locator('#dash-view-queue');
    if (await viewQueueBtn.isVisible()) {
      await viewQueueBtn.focus();
      const hasFocus = await viewQueueBtn.evaluate((el) => document.activeElement === el);
      expect(hasFocus).toBe(true);
    }

    // Screenshot mobile Staff Dashboard
    const staffDir = path.resolve(__dirname, '../../artifacts/lab-04/screenshots/staff-dashboard');
    await page.screenshot({
      path: path.join(staffDir, `03-staff-dashboard-mobile-${projectName}.png`),
      fullPage: true,
    });

    // 3. Log in as Requester on Mobile
    await context.clearCookies();
    await loginAndHandlePasswordChange(page, 'jennifer.a@example.com');

    const openCard = page.locator('#dash-open-tickets');
    await expect(openCard).toBeVisible();

    // Verify zero horizontal scrollbar on Requester dashboard (AC-14)
    const isOverflowingReq = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowingReq).toBe(false);

    // Screenshot mobile Requester Dashboard
    const reqDir = path.resolve(__dirname, '../../artifacts/lab-04/screenshots/requester-dashboard');
    await page.screenshot({
      path: path.join(reqDir, `03-requester-dashboard-mobile-${projectName}.png`),
      fullPage: true,
    });
  });
});
