// tests/fr7-user-registration.spec.js
import { test, expect } from '@playwright/test';

test('FR7 - User can create an account with a new email', async ({ page }) => {
  await page.goto('https://bearcat-event-manger.onrender.com');

  // Navigate to Sign Up/Register page
  await page.getByRole('link', { name: /sign up|register/i }).click();

  // Fill registration form
  await page.getByLabel(/email/i).fill('user2@example.com');
  await page.getByLabel(/Password/i).nth(0).fill('user123');
  await page.getByLabel(/Confirm Password/i).fill('user123');
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Redirect
  await expect(page.locator('text=My Tickets')).toBeVisible();
});
