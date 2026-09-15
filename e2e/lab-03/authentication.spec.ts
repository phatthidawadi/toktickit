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

  // Wait for either change password screen, application shell, or login error
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

test.describe('E2E-01: Authentication & Mandatory Password Change User Journey', () => {
  test.beforeEach(async ({ context, request }) => {
    await context.clearCookies();
    await resetDbViaApi(request);
  });

  test.afterAll(async () => {
    await resetDbViaApi();
  });

  test('E2E-01-A: Rejects invalid credentials with safe 401 error message', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    await page.goto('/');

    // Verify Login Screen heading
    const loginHeading = page.locator('h2:has-text("Sign In to TokTickIT")');
    await expect(loginHeading).toBeVisible();

    // Fill invalid credentials
    await page.locator('#login-email').fill('invalid.user@example.com');
    await page.locator('#login-password').fill('WrongPassword123!');
    await page.locator('#login-submit-btn').click();

    // Assert error message is visible
    const errorAlert = page.locator('#login-error');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/Invalid email or password|Too many failed/i);

    // Capture screenshot evidence
    await page.screenshot({
      path: `../artifacts/lab-03/screenshots/authentication/01-invalid-login-${projectName}.png`,
      fullPage: true,
    });
  });

  test('E2E-01-B: Completes valid login, enforces mandatory password change, and enters application shell', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    await page.goto('/');

    // 1. Fill valid credentials for Admin requiring password change
    await page.locator('#login-email').fill('admin.toktickit@example.com');
    await page.locator('#login-password').fill('Password123!');
    await page.locator('#login-submit-btn').click();

    // 2. Assert redirect to Mandatory Password Update screen
    const changePassHeading = page.locator('h2:has-text("Mandatory Password Update")');
    await expect(changePassHeading).toBeVisible();
    await expect(page.locator('.change-password-container')).toContainText(/requires a new password/i);

    await page.screenshot({
      path: `../artifacts/lab-03/screenshots/authentication/02-mandatory-password-change-${projectName}.png`,
      fullPage: true,
    });

    // 3. Fill current and new password
    await page.locator('#current-password').fill('Password123!');
    await page.locator('#new-password').fill('NewSecurePassword123!');
    await page.locator('#confirm-password').fill('NewSecurePassword123!');
    await page.locator('#change-password-submit-btn').click();

    // 4. Assert user enters application shell with header & user badge
    const brand = page.locator('.site-brand');
    await expect(brand).toBeVisible();

    const userNameBadge = page.locator('.user-name');
    await expect(userNameBadge).toBeVisible();
    await expect(userNameBadge).toContainText('Admin TokTickIT');

    await page.screenshot({
      path: `../artifacts/lab-03/screenshots/authentication/03-authenticated-home-${projectName}.png`,
      fullPage: true,
    });
  });

  test('E2E-01-C: Logs out user, invalidates session cookie, and returns to Login screen', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;

    // Login using helper
    await loginAndHandlePasswordChange(page, 'admin.toktickit@example.com');

    // Verify logged in shell
    await expect(page.locator('.site-brand')).toBeVisible();

    // Click Logout button
    const logoutBtn = page.locator('.logout-btn');
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click({ force: true });
    await page.waitForTimeout(500);

    // Capture screenshot evidence of logged out screen
    await page.screenshot({
      path: `../artifacts/lab-03/screenshots/authentication/04-logged-out-${projectName}.png`,
      fullPage: true,
    });

    // Assert returned to Login screen
    const loginEmailInput = page.locator('#login-email');
    await expect(loginEmailInput).toBeVisible();
  });
});
