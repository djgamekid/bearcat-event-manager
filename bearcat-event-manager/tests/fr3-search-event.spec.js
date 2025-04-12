// tests/fr3-search-event.spec.js
import { test, expect } from '@playwright/test';

test('FR3 - Signed-in user can search for events from Find Events page', async ({ page }) => {
  await page.goto('https://bearcat-event-manger.onrender.com');

  // Click "Sign In" from navbar
  await page.getByRole('button', { name: /Sign In/i }).click();

  // Fill in credentials
  await page.getByLabel(/email/i).fill('user@example.com');
  await page.getByLabel(/password/i).fill('user123');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for dashboard or home redirect
  await expect(page.getByText(/Welcome Back/i)).toBeVisible();

  // Navigate to "Find Events"
  await page.getByRole('link', { name: /find events/i }).click();
  await expect(page).toHaveURL(/events/i);

  // Use the search bar
  const searchInput = page.getByPlaceholder(/Search events.../i);
  await searchInput.fill('soccer');
  await page.keyboard.press('Enter');

  // Assert search result appears
  await expect(page.getByText(/Soccer Event/i)).toBeVisible();
});
