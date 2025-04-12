// tests/fr1-ticket-purchase.spec.js
import { test, expect } from '@playwright/test';

test('FR1 - User can get a ticket for an event', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('https://bearcat-event-manger.onrender.com');

  // Wait for events to load and select the first one
  await expect(page.getByText('Featured Events')).toBeVisible();
  const eventCards = await page.locator('.card-body'); // Update selector if needed
  await expect(eventCards.first()).toBeVisible();

  // Click on the first event's "Get Ticket" or equivalent button
  await eventCards.first().getByRole('button', { name: 'View Details' }).click();

  // Verify that ticket confirmation or cart page is shown
  await expect(page).toHaveURL(/.*user-ticket/i);
  await expect(page.locator('text=Sign in to Purchase')).toBeVisible(); // Adjust to real confirmation

  // Optionally: confirm ticket appears in cart/local storage
});
