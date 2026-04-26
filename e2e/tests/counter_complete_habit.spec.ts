import { expect, test } from '@playwright/test';

test('user can add a habit and complete it', async ({ page }) => {
  await page.goto('/');

  await page.waitForSelector('[data-testid="today-screen"], [data-testid="today-screen-loading"]', {
    timeout: 30_000,
  });
  await expect(page.getByTestId('today-screen')).toBeVisible({ timeout: 30_000 });

  await expect(page.getByTestId('habit-add-fab')).toBeVisible();
  await page.getByTestId('habit-add-fab').click();

  await expect(page.getByTestId('add-habit-sheet-title')).toBeVisible({ timeout: 6_000 });
  await page.getByTestId('habit-name-input').fill('Stretch 5 min');
  await page.getByTestId('habit-frequency-daily').click();
  await page.getByTestId('habit-save-button').click();

  await expect(page.getByText('Habit added')).toBeVisible({ timeout: 4_000 });
  await expect(page.getByText('Stretch 5 min')).toBeVisible();
});
