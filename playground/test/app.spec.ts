import { test, expect } from '@playwright/test';

test('GET / returns 200', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
});

test('withholds the protected page when unauthenticated', async ({ page }) => {
  // The guard triggers a signin redirect to the external IdP. Without a live
  // IdP it cannot navigate, so we assert the guard's behaviour directly: the
  // OnRedirecting fallback is shown and the protected content is withheld.
  // (The nav has a "Profile" link, so we target the page heading by role.)
  await page.goto('/profile');

  await expect(page.getByText(/Redirecting to sign in/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Profile' })).toHaveCount(0);
});

test('/auth/callback without params renders without crashing', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  const response = await page.goto('/auth/callback');
  expect(response?.status()).toBe(200);

  // The callback component shows a loading/transition message and must not
  // throw when no code/state params are present.
  await expect(page.locator('#root')).not.toBeEmpty();
  expect(errors).toEqual([]);
});
