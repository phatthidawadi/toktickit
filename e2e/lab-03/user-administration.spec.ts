import { test, expect, Page } from '@playwright/test';

async function resetDbViaApi(request?: any) {
  try {
    if (request) {
      await request.post('http://localhost:3000/api/test/reset-db');
      await request.post('http://localhost:3000/api/test/reset-rate-limit');
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

test.describe('E2E-03: Admin User Management & Safety Safeguards E2E Journey', () => {
  test.beforeEach(async ({ context, request }) => {
    await context.clearCookies();
    await resetDbViaApi(request);
  });

  test.afterAll(async () => {
    await resetDbViaApi();
  });

  test('E2E-03-A: Log in as Administrator, access User Management portal, search/filter, and create user account', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;

    // 1. Log in as Admin
    await loginAndHandlePasswordChange(page, 'admin.toktickit@example.com');

    // 2. Navigate to User Management
    const userMgmtNav = page.locator('button:has-text("User Management")');
    await expect(userMgmtNav).toBeVisible();
    await userMgmtNav.click({ force: true });

    // Assert User Management heading loaded
    const heading = page.locator('h2:has-text("User Management")');
    await expect(heading).toBeVisible();

    // Search for user
    const searchInput = page.locator('#user-search-input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Jennifer');
    await expect(page.locator('tr:has-text("Jennifer Anderson")')).toBeVisible();
    await searchInput.fill('');

    // 3. Open Create User Modal
    const createBtn = page.locator('button:has-text("+ Create User")');
    await expect(createBtn).toBeVisible();
    await createBtn.click({ force: true });

    // Fill Create User modal fields
    const modalHeading = page.locator('h4:has-text("Create New User Account")');
    await expect(modalHeading).toBeVisible();

    await page.locator('#create-name-input').fill('E2E Test User');
    await page.locator('#create-email-input').fill('e2e.test.user@example.com');
    await page.locator('#create-role-select').selectOption('REQUESTER');
    await page.locator('#create-password-input').fill('Password123!');

    await page.screenshot({
      path: `artifacts/lab-03/screenshots/user-management/01-create-user-modal-${projectName}.png`,
      fullPage: true,
    });

    // Submit Create User form
    await page.locator('button[type="submit"]:has-text("Create User")').click({ force: true });

    // Assert new user exists in table
    const newUserRow = page.locator('tr:has-text("e2e.test.user@example.com")');
    await expect(newUserRow).toBeVisible();
    await expect(newUserRow).toContainText('E2E Test User');

    await page.screenshot({
      path: `artifacts/lab-03/screenshots/user-management/02-user-created-table-${projectName}.png`,
      fullPage: true,
    });
  });

  test('E2E-03-B: Edit user role, reset initial password, and enforce self-deactivation & last-admin safety protections', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;

    // 1. Log in as Admin
    await loginAndHandlePasswordChange(page, 'admin.toktickit@example.com');

    // 2. Open User Management
    await page.locator('button:has-text("User Management")').click({ force: true });
    await expect(page.locator('h2:has-text("User Management")')).toBeVisible();

    // 3. Edit User Role for Jennifer Anderson
    const editBtn = page.locator('tr:has-text("jennifer.a@example.com") button:has-text("Edit")').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click({ force: true });

    const editModalHeading = page.locator('h4:has-text("Edit User Account")');
    await expect(editModalHeading).toBeVisible();

    await page.locator('#edit-role-select').selectOption('IT_STAFF');
    await page.locator('button[type="submit"]:has-text("Save Changes")').click({ force: true });

    // Assert role badge updated to IT Staff
    const updatedRoleBadge = page.locator('tr:has-text("jennifer.a@example.com") .role-badge-staff');
    await expect(updatedRoleBadge).toBeVisible();

    // 4. Reset Password for Jennifer Anderson
    const resetBtn = page.locator('tr:has-text("jennifer.a@example.com") button:has-text("Reset Password")').first();
    await expect(resetBtn).toBeVisible();
    await resetBtn.click({ force: true });

    const resetModalHeading = page.locator('h4:has-text("Reset Initial Password")');
    await expect(resetModalHeading).toBeVisible();

    await page.locator('#reset-password-input').fill('NewInitialPass123!');
    await page.locator('button[type="submit"]:has-text("Set Initial Password")').click({ force: true });

    const resetSuccessMsg = page.locator('text="Initial password reset successfully!"');
    await expect(resetSuccessMsg).toBeVisible();

    await page.screenshot({
      path: `artifacts/lab-03/screenshots/user-management/03-role-edited-password-reset-${projectName}.png`,
      fullPage: true,
    });

    // Wait for reset modal to close
    await expect(resetModalHeading).not.toBeVisible();

    // 5. Safety Safeguard 1: Self-Deactivation Protection (SELF_DEACTIVATION_PROHIBITED)
    const selfEditBtn = page.locator('tr:has-text("admin.toktickit@example.com") button:has-text("Edit")').first();
    await expect(selfEditBtn).toBeVisible();
    await selfEditBtn.click({ force: true });

    await expect(page.locator('h4:has-text("Edit User Account")')).toBeVisible();

    // Uncheck active status checkbox
    const activeCheckbox = page.locator('#edit-active-check');
    if (await activeCheckbox.isChecked()) {
      await activeCheckbox.uncheck();
    }

    await page.locator('button[type="submit"]:has-text("Save Changes")').click({ force: true });

    // Hard Assertion: SELF_DEACTIVATION_PROHIBITED error banner visible
    const selfDeactError = page.locator('.error-alert, .alert-danger');
    await expect(selfDeactError).toBeVisible();
    await expect(selfDeactError).toContainText(/prohibited from deactivating/i);

    await page.screenshot({
      path: `artifacts/lab-03/screenshots/user-management/04-self-deactivation-warning-${projectName}.png`,
      fullPage: true,
    });

    // Close self edit modal
    await page.locator('button:has-text("Cancel")').first().click({ force: true });

    // 6. Safety Safeguard 2: Last-Admin Protection (LAST_ADMIN_PROTECTION)
    await selfEditBtn.click({ force: true });
    await expect(page.locator('h4:has-text("Edit User Account")')).toBeVisible();

    // Change role from ADMINISTRATOR to REQUESTER
    await page.locator('#edit-role-select').selectOption('REQUESTER');
    await page.locator('button[type="submit"]:has-text("Save Changes")').click({ force: true });

    // Hard Assertion: LAST_ADMIN_PROTECTION error banner visible
    const lastAdminError = page.locator('.error-alert, .alert-danger');
    await expect(lastAdminError).toBeVisible();
    await expect(lastAdminError).toContainText(/last active administrator/i);

    await page.screenshot({
      path: `artifacts/lab-03/screenshots/user-management/05-last-admin-protection-warning-${projectName}.png`,
      fullPage: true,
    });

    await page.locator('button:has-text("Cancel")').first().click({ force: true });
  });
});
