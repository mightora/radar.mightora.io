import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('built guide is crawlable without JavaScript and local links and assets resolve', async ({ browser, request }) => {
  const built = await readFile(new URL('../../dist/guide/index.html', import.meta.url), 'utf8');
  expect(built).toContain('<h1>Technology Radar Live Editor guide</h1>');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8080/guide/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Technology Radar Live Editor guide');
  await expect(page.locator('main section')).toHaveCount(12);
  await expect(page.getByRole('navigation', { name: 'On this page' }).locator('a')).toHaveCount(12);
  const urls = await page.locator('a[href], link[href], script[src]').evaluateAll(elements => elements.map(element => element.href || element.src));
  const nav = JSON.parse(await page.locator('mightora-header').getAttribute('nav-links'));
  urls.push(...nav.map(link => new URL(link.url, page.url()).href));
  for (const href of new Set(urls)) {
    const url = new URL(href);
    if (url.origin !== new URL(page.url()).origin) continue;
    const response = await request.get(href);
    expect(response.ok(), href).toBe(true);
    if (url.hash) {
      const markup = await response.text();
      expect(markup, href).toContain(`id="${url.hash.slice(1)}"`);
    }
  }
  await page.getByRole('link', { name: 'Quick start', exact: true }).click();
  await expect(page).toHaveURL(/\/guide\/#quick-start$/);
  await context.close();
});

test('Documentation links open the guide and documented controls exist', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#sourceStatus')).toHaveText(/valid technologies$/);
  await expect(page.locator('#docsButton')).toHaveAttribute('href', 'guide/');
  await expect(page.getByRole('link', { name: 'GitHub', exact: true }).first()).toHaveAttribute('href', 'https://github.com/mightora/radar.mightora.io');
  // Keyboard activation opens a separate guide tab, preserving the active editor session.
  await page.locator('#docsButton').focus();
  const opened = page.waitForEvent('popup');
  await page.keyboard.press('Enter');
  const guide = await opened;
  await guide.waitForURL('**/guide/');
  await expect(guide.getByRole('heading', { level: 1 })).toHaveText('Technology Radar Live Editor guide');
  const text = await guide.locator('main').textContent();
  for (const name of ['Undo', 'Redo', 'New', 'Upload CSV', 'Download CSV', 'Share', 'Toggle labels', 'Reset view', 'Editor', 'Preview', 'Exports']) {
    expect(text).toContain(name);
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole('button', { name: /^Errors / })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Load example', exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Radar', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Editor', exact: true }).click();
  await page.getByRole('button', { name: 'Visual', exact: true }).click();
  for (const name of ['Add row', 'Clear filters', 'Move up row 2', 'Move down row 2', 'Duplicate row 2', 'Delete row 2']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  }
  await expect(page.getByLabel('Filter rows', { exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Filter by radar', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'CSV', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Format CSV', exact: true })).toBeVisible();
  await expect(page.getByLabel('CSV radar source')).toBeVisible();
  await page.getByLabel('CSV radar source').fill('broken header');
  await page.getByRole('button', { name: 'Visual', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Switch to CSV to fix' })).toBeVisible();
  await page.getByRole('button', { name: 'Exports', exact: true }).click();
  for (const name of ['CSV', '.radar.json', 'SVG', 'PNG', 'Print']) {
    await expect(page.locator('.export-card').filter({ has: page.locator('strong', { hasText: name }) }).first()).toBeVisible();
  }
  await page.getByRole('button', { name: 'Share', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'View link' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Edit link' })).toBeVisible();
  await page.getByRole('button', { name: 'Generate link', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Copy link', exact: true })).toBeVisible();
  await expect(page.getByLabel('Generated URL')).toBeVisible();
  expect(await page.locator('#shareDialog .warning').textContent()).toBe(await guide.locator('#privacy-warning p').textContent());
  await page.keyboard.press('Escape');
  page.on('dialog', dialog => dialog.accept());
  await page.locator('mightora-header').getByRole('link', { name: 'Documentation', exact: true }).click();
  await expect(page).toHaveURL(/\/guide\/$/);
  await page.getByRole('link', { name: 'Open the editor', exact: true }).first().click();
  await expect(page.locator('#csvInput')).toHaveValue('broken header');
  await guide.close();
});

for (const width of [360, 390, 768, 1024, 1280]) {
  test(`guide is readable and keyboard accessible at ${width}px`, async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/guide/', { waitUntil: 'networkidle' });
    await expect(page.locator('mightora-header nav')).toBeAttached();
    const brand = await page.locator('mightora-header .site-logo-text').boundingBox();
    const headerButtons = await page.locator('mightora-header .flex-gap').boundingBox();
    expect(brand.x + brand.width).toBeLessThanOrEqual(headerButtons.x);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to guide' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#guide-content')).toBeFocused();
    const toc = page.getByRole('navigation', { name: 'On this page' });
    await toc.getByRole('link', { name: 'Quick start', exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect(toc.getByRole('link', { name: 'Loading an example', exact: true })).toBeFocused();
    const focus = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
    expect(focus).toBe('solid');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#examples$/);
    const bounds = await page.locator('#examples').boundingBox();
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    const menu = page.getByRole('button', { name: 'Open navigation menu' });
    if (await menu.isVisible()) {
      await menu.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('mightora-header').getByRole('link', { name: 'Documentation', exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.locator('mightora-header .mobile-menu-btn').focus();
      await page.keyboard.press('Enter');
    }
    for (const link of await toc.locator('a').all()) {
      expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
    const dimensions = await page.evaluate(() => ({ width: innerWidth, pageWidth: document.documentElement.scrollWidth }));
    expect(dimensions.pageWidth).toBeLessThanOrEqual(width);
    console.log('D01 viewport:', JSON.stringify(dimensions));
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`guide-${width}.png`) });
    expect(errors).toEqual([]);
  });
}
