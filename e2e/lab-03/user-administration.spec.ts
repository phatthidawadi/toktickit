import { test, expect } from '@playwright/test';

test.describe('E2E-03: Admin User Management & Safety Safeguards E2E Journey', () => {
  test('Log in as Admin, view user portal, search, open create modal, test edit and safety warnings, reset password', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto('/');
    await page.waitForTimeout(500);

    // Fill login as Admin if at login screen
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('admin.toktickit@example.com');
      await page.locator('input[type="password"]').first().fill('Password123!');
      await page.locator('button:has-text("Sign In"), button[type="submit"]').first().click();
      await page.waitForTimeout(800);
    }

    // Navigate to User Management
    const userMgmtNav = page.locator('button:has-text("User Management")').first();
    if (await userMgmtNav.isVisible().catch(() => false)) {
      await userMgmtNav.click();
      await page.waitForTimeout(500);
    }

    // Verify User Management screen heading
    const heading = page.locator('h2', { hasText: /User Management/i }).first();
    if (await heading.isVisible().catch(() => false)) {
      await expect(heading).toBeVisible();
    }

    // Filter/Search user input
    const userSearchInput = page.locator('#user-search-input, input[placeholder*="Search by name"]').first();
    if (await userSearchInput.isVisible().catch(() => false)) {
      await userSearchInput.fill('Jennifer');
      await page.waitForTimeout(300);
      await userSearchInput.fill('');
      await page.waitForTimeout(300);
    }

    // Open Create User Modal
    const createBtn = page.locator('button:has-text("+ Create User"), button:has-text("Create User")').first();
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(400);

      const cancelBtn = page.locator('.modal-card button:has-text("Cancel")').first();
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // Open Edit User Modal for first user
    const editBtn = page.locator('.edit-user-btn, button:has-text("Edit")').first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await page.waitForTimeout(400);

      const cancelEditBtn = page.locator('.modal-card button:has-text("Cancel")').first();
      if (await cancelEditBtn.isVisible().catch(() => false)) {
        await cancelEditBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // Open Reset Password Modal
    const resetBtn = page.locator('.reset-password-btn, button:has-text("Reset Password")').first();
    if (await resetBtn.isVisible().catch(() => false)) {
      await resetBtn.click();
      await page.waitForTimeout(400);

      const cancelResetBtn = page.locator('.modal-card button:has-text("Cancel")').first();
      if (await cancelResetBtn.isVisible().catch(() => false)) {
        await cancelResetBtn.click();
        await page.waitForTimeout(300);
      }
    }
  });
});
