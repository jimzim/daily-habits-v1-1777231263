import { expect, test } from '@playwright/test';

test('empty state shows after resetting demo and deleting all habits', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByTestId('settings-screen')).toBeVisible({ timeout: 30_000 });

  // Reset demo
  await page.getByTestId('reset-demo-button').click();
  await page.getByTestId('confirm-reset-demo-confirm').click();
  await expect(page.getByText('Demo data reset')).toBeVisible({ timeout: 4_000 });

  // Go to Today and verify list is non-empty
  await page.getByTestId('tab-today').click();
  await expect(page.getByTestId('today-screen')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Drink water')).toBeVisible({ timeout: 8_000 });

  // Delete every visible habit one by one (web exposes a Delete button per row)
  for (let i = 0; i < 10; i++) {
    const deleteButtons = page.locator('[data-testid^="habit-delete-button-"]');
    const count = await deleteButtons.count();
    if (count === 0) break;
    await deleteButtons.first().click();
    await page.getByTestId('confirm-delete-habit-confirm').click();
    // Wait briefly for the toast to settle so the next delete button is interactable.
    await page.waitForTimeout(250);
  }

  await expect(page.getByTestId('today-empty')).toBeVisible({ timeout: 6_000 });
  await expect(page.getByText('No habits yet')).toBeVisible();
});
