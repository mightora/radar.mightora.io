import { expect, test } from '@playwright/test';

test('built app renders the radar preview', async ({ page }) => {
  await page.goto('/');
  await page.locator('.tab[data-tab="preview"]').click();

  const radar = page.locator('#radarCanvas svg.radar-svg');
  await expect(radar).toBeVisible();
  await expect(radar.locator('circle')).not.toHaveCount(0);
});