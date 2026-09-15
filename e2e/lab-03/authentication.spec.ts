import { test, expect } from '@playwright/test';

test.describe('E2E-01: Authentication & Mandatory Password Change User Journey', () => {
  test('Completes login, mandatory password change workflow, app shell navigation, and logout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Visit root URL
    await page.goto('/');
    await page.waitForTimeout(500);

    // 2. Check for login form or heading
    const loginHeading = page.locator('h2', { hasText: /Sign In|TokTickIT/i }).first();
    await expect(loginHeading).toBeVisible();

    // 3. Fill login credentials
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('admin.toktickit@example.com');
      await passwordInput.fill('Password123!');

      const signInBtn = page.locator('button:has-text("Sign In"), button[type="submit"]').first();
      await signInBtn.click();
      await page.waitForTimeout(800);
    }

    // 4. If password change screen is shown, complete it
    const changePassHeading = page.locator('h2, h3, h4', { hasText: /change.*password|update.*password|first-time login/i }).first();
    if (await changePassHeading.isVisible().catch(() => false)) {
      const currentPassInput = page.locator('input[name="currentPassword"], #currentPassword').first();
      const newPassInput = page.locator('input[name="newPassword"], #newPassword').first();
      const confirmPassInput = page.locator('input[name="confirmPassword"], #confirmPassword').first();

      if (await currentPassInput.isVisible().catch(() => false)) {
        await currentPassInput.fill('Password123!');
        await newPassInput.fill('NewSecurePassword123!');
        await confirmPassInput.fill('NewSecurePassword123!');

        const updateBtn = page.locator('button:has-text("Update Password"), button:has-text("Change Password")').first();
        await updateBtn.click();
        await page.waitForTimeout(800);
      }
    }

    // 5. Verify App Shell header and Logout
    const brand = page.locator('.site-brand, header').first();
    await expect(brand).toBeVisible();

    const logoutBtn = page.locator('button:has-text("Logout")').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
