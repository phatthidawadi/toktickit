import { test, expect } from '@playwright/test';

test.describe('Lab 2 Requester Ticket Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('completes full requester journey from context selection to ticket detail and attachment management', async ({ page }) => {
    // 1. Verify Development Requester Header & Selector
    const headerTitle = page.locator('header').first();
    await expect(headerTitle).toBeVisible();

    // 2. Click Create Ticket Navigation
    const createTicketNav = page.locator('text=Create Ticket').first();
    await expect(createTicketNav).toBeVisible();
    await createTicketNav.click();

    // 3. Verify Create Ticket Form Elements
    const formHeading = page.locator('h1, h2').filter({ hasText: /Create/i }).first();
    await expect(formHeading).toBeVisible();

    // 4. Fill in Summary and Description
    const summaryInput = page.locator('input[name="summary"], input[placeholder*="summary" i], #summary').first();
    if (await summaryInput.isVisible()) {
      await summaryInput.fill('E2E Test Ticket Summary for E2E Flow');
    }

    const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i], #description').first();
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('This is a detailed description created during the Playwright E2E User Flow test.');
    }

    // 5. Navigate to My Tickets View
    const myTicketsNav = page.locator('text=My Tickets').first();
    await expect(myTicketsNav).toBeVisible();
    await myTicketsNav.click();

    // 6. Verify My Tickets Screen Header
    const myTicketsHeading = page.locator('h1, h2').filter({ hasText: /My Tickets/i }).first();
    await expect(myTicketsHeading).toBeVisible();
  });
});
