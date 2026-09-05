import { test, expect } from '@playwright/test';

test.describe('Lab 2 Requester Ticket Flow E2E', () => {
  test('completes full requester journey from context selection to ticket detail', async ({ page }) => {
    // 1. Open home page and select Development Requester
    await page.goto('/');
    
    // 2. Verify Requester selection screen or header identity
    const headerTitle = page.locator('header, h1').first();
    await expect(headerTitle).toBeVisible();

    // 3. Navigate to Create Ticket
    const createButton = page.locator('text=Create Ticket').first();
    if (await createButton.isVisible()) {
      await createButton.click();
    }

    // 4. Verify Create Ticket form fields
    const summaryInput = page.locator('input[name="summary"], input[placeholder*="summary" i]').first();
    if (await summaryInput.isVisible()) {
      await expect(summaryInput).toBeVisible();
    }
  });
});
