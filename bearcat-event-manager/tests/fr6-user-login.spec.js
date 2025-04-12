// tests/fr6-user-login.spec.js
import { test, expect } from '@playwright/test';

test('FR6 - User can log in with valid credentials', async ({ page }) => {
  await page.goto('https://bearcat-event-manger.onrender.com');

  // Navigate to Sign In page
  await page.getByRole('link', { name: /Login/i }).click();

  // Fill in user credentials
  await page.getByLabel(/email/i).fill('user@example.com');
  await page.getByLabel(/password/i).fill('user123');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Verify successful login (e.g., user redirected or dashboard visible)
  await expect(page.getByText(/welcome back/i)).toBeVisible();
});
