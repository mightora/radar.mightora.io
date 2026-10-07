import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';

function parseCsv(source) {
  const rows = []; let row = [], value = '', quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index], next = source[index + 1];
    if (character === '"' && quoted && next === '"') { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { row.push(value); value = ''; }
    else if ((character === '\r' || character === '\n') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(value); value = ''; if (row.some(Boolean)) rows.push(row); row = [];
    } else value += character;
  }
  if (quoted) throw new Error('Unclosed quote');
  if (value || row.length) { row.push(value); rows.push(row); }
  return rows;
}

test('built app renders the radar preview', async ({ page }) => {
  await page.goto('/');
  await page.locator('.tab[data-tab="preview"]').click();

  const radar = page.locator('#radarCanvas svg.radar-svg');
  await expect(radar).toBeVisible();
  await expect(radar.locator('circle')).not.toHaveCount(0);
});

test('example picker lists every file and each example validates', async ({ page }) => {
  const app = await readFile(new URL('../../src/app.js', import.meta.url), 'utf8');
  const files = await readdir(new URL('../../public/examples/', import.meta.url));
  const entries = [...app.matchAll(/'([^']+)': '(public\/examples\/[^']+\.csv)'/g)].map(([, name, path]) => ({ name, path }));

  expect(entries.map(entry => entry.path.split('/').at(-1)).sort()).toEqual(files.filter(file => file.endsWith('.csv')).sort());
  await page.goto('/');
  page.on('dialog', dialog => dialog.accept());

  const picker = page.getByLabel('Load example');
  await expect(picker.locator('option')).toHaveCount(entries.length + 1);
  await expect(picker.locator('option').allTextContents()).resolves.toEqual(['Choose an example', ...entries.map(entry => entry.name)]);

  for (const entry of entries) {
    const source = await readFile(new URL(`../../${entry.path}`, import.meta.url), 'utf8');
    await picker.selectOption({ label: entry.name });
    await page.waitForTimeout(350);
    await expect(page.locator('#csvInput')).toHaveValue(source.replaceAll('\r\n', '\n'));
    await expect(page.locator('#errorCount')).toHaveText('0');
    await expect(page.locator('#sourceStatus')).toHaveText(/^\d+ valid technologies$/);
    expect(await page.evaluate(() => localStorage.getItem('radar-builder-source'))).toBe(source);
  }
});

test('example picker supports keyboard, cancel, fetch failure, and undo', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#sourceStatus')).toHaveText(/^\d+ valid technologies$/);
  const originalSource = await page.locator('#csvInput').inputValue();
  const picker = page.getByLabel('Load example');
  const firstExample = await readFile(new URL('../../public/examples/power-platform.csv', import.meta.url), 'utf8');

  await picker.focus();
  await picker.press('ArrowDown');
  await picker.press('Enter');
  await page.waitForTimeout(350);
  await expect(page.locator('#csvInput')).toHaveValue(firstExample.replaceAll('\r\n', '\n'));
  await expect(picker).toHaveValue('');

  await page.locator('#undoButton').click();
  await page.waitForTimeout(350);
  await expect(page.locator('#csvInput')).toHaveValue(originalSource);
  expect(await page.evaluate(() => localStorage.getItem('radar-builder-source'))).toBe(originalSource);

  page.once('dialog', dialog => dialog.dismiss());
  await picker.selectOption({ label: 'Software Development Radar' });
  await expect(page.locator('#csvInput')).toHaveValue(originalSource);
  await expect(picker).toHaveValue('');

  await page.route('**/public/examples/software-development.csv', route => route.abort());
  page.once('dialog', dialog => dialog.accept());
  await picker.selectOption({ label: 'Software Development Radar' });
  await expect(page.locator('#toast')).toContainText('Could not load the');
  await expect(page.locator('#csvInput')).toHaveValue(originalSource);
  expect(await page.evaluate(() => localStorage.getItem('radar-builder-source'))).toBe(originalSource);
});

test('v1 shared links load view and edit data before stored source', async ({ page, browser }) => {
  await page.goto('/');
  const sharedSource = 'Radar Name,Category,Sub Category,Technology,Status,Dot Status\nShared Radar,Platform,Runtime,Shared Technology,Assess,Standard';
  await page.locator('#csvInput').fill(sharedSource);
  await expect(page.locator('#sourceStatus')).toHaveText('1 valid technologies');

  await page.locator('#shareButton').click();
  await page.locator('[name="shareMode"][value="view"]').check();
  await page.locator('#generateShare').click();
  await expect(page.locator('#shareUrl')).not.toHaveValue('');
  const viewUrl = await page.locator('#shareUrl').inputValue();
  await page.locator('[name="shareMode"][value="edit"]').check();
  await page.locator('#generateShare').click();
  await expect(page.locator('#shareUrl')).not.toHaveValue(viewUrl);
  const editUrl = await page.locator('#shareUrl').inputValue();
  await page.locator('#cancelShare').click();

  const storedSource = 'Radar Name,Category,Sub Category,Technology,Status,Dot Status\nStored Radar,Platform,Runtime,Stored Technology,Assess,Standard';
  for (const [url, mode] of [[viewUrl, 'view'], [editUrl, 'edit']]) {
    const context = await browser.newContext();
    await context.addInitScript(source => localStorage.setItem('radar-builder-source', source), storedSource);
    const receiver = await context.newPage();
    await receiver.goto(url, { waitUntil: 'domcontentloaded' });
    await expect(receiver.locator('#csvInput')).toHaveValue(sharedSource);
    await expect(receiver.locator('#sourceStatus')).toHaveText('1 valid technologies');
    if (mode === 'view') {
      await expect(receiver.locator('#dataPanel')).toHaveClass(/hidden/);
      await expect(receiver.locator('#previewPanel')).toHaveClass(/active-panel/);
    } else {
      await expect(receiver.locator('#dataPanel')).not.toHaveClass(/hidden/);
      await expect(receiver.locator('#dataPanel')).toHaveClass(/active-panel/);
    }
    await context.close();
  }
});

test('visual and CSV modes round-trip every example and remember the mode', async ({ page }) => {
  const app = await readFile(new URL('../../src/app.js', import.meta.url), 'utf8');
  const entries = [...app.matchAll(/'([^']+)': '(public\/examples\/[^']+\.csv)'/g)].map(([, name, path]) => ({ name, path }));
  await page.goto('/');
  page.on('dialog', dialog => dialog.accept());
  const picker = page.getByLabel('Load example');

  for (const entry of entries) {
    const expectedRows = parseCsv(await readFile(new URL(`../../${entry.path}`, import.meta.url), 'utf8'));
    await picker.selectOption({ label: entry.name });
    await expect(page.locator('#sourceStatus')).toHaveText(/valid technologies$/);
    await page.locator('#visualMode').click();
    await expect(page.locator('#visualTable tbody tr')).toHaveCount(expectedRows.length - 1);
    await expect(page.locator('#visualTable select').first().locator('option')).toContainText(['Assess', 'Trial', 'Deploy', 'Sunset', 'Decommission']);
    await page.locator('#csvMode').click();
    expect(parseCsv(await page.locator('#csvInput').inputValue())).toEqual(expectedRows);
  }

  await page.locator('#visualMode').click();
  expect(await page.evaluate(() => localStorage.getItem('radar-builder-editor-mode'))).toBe('visual');
  await page.reload();
  await expect(page.locator('#visualEditor')).toBeVisible();
  await expect(page.locator('#csvMode')).toHaveAttribute('aria-pressed', 'false');
});

test('visual editor preserves special CSV values, validation, undo, and redo', async ({ page }) => {
  await page.goto('/');
  const source = 'Radar Name,Category,Sub Category,Technology,Status,Dot Status\n"Radar, ""One""",Platform,"Sub\nCategory","<img src=x onerror=alert(1)>, ""quoted""\nname",Assess,Standard';
  await page.locator('#csvInput').fill(source);
  await expect(page.locator('#sourceStatus')).toHaveText('1 valid technologies');
  await page.locator('#visualMode').click();
  await expect(page.locator('#visualTable textarea')).toHaveCount(2);
  await expect(page.locator('#visualTable img')).toHaveCount(0);
  await expect(page.locator('#visualTable [aria-label="Technology, row 1"]')).toHaveValue('<img src=x onerror=alert(1)>, "quoted"\nname');
  await page.locator('#csvMode').click();
  expect(parseCsv(await page.locator('#csvInput').inputValue())).toEqual(parseCsv(source));

  await page.locator('#visualMode').click();
  const technology = page.locator('#visualTable [aria-label="Technology, row 1"]');
  await technology.fill('Visual update');
  await technology.press('Tab');
  await expect(page.locator('#sourceStatus')).toHaveText('1 valid technologies');
  await expect(page.locator('#csvInput')).toHaveValue(/Visual update/);
  await expect(page.locator('#radarCanvas')).toContainText('Visual update');
  await page.locator('#undoButton').click();
  await expect(page.locator('#visualTable [aria-label="Technology, row 1"]')).toHaveValue('<img src=x onerror=alert(1)>, "quoted"\nname');
  await page.locator('#redoButton').click();
  await expect(page.locator('#visualTable [aria-label="Technology, row 1"]')).toHaveValue('Visual update');

  const category = page.locator('#visualTable [aria-label="Category, row 1"]');
  await category.fill('');
  await category.press('Tab');
  await expect(page.locator('#errorCount')).toHaveText('1');
  await expect(page.locator('#sourceStatus')).toContainText('Preview is showing the last valid version');
  await expect(category).toHaveAttribute('aria-invalid', 'true');
  const descriptionId = await category.getAttribute('aria-describedby');
  await expect(page.locator(`#${descriptionId}`)).toContainText('Category cannot be empty.');
  await page.locator('#undoButton').click();
  await expect(page.locator('#visualTable [aria-label="Category, row 1"]')).toHaveValue('Platform');
  await page.locator('#redoButton').click();
  await expect(page.locator('#visualTable [aria-label="Category, row 1"]')).toHaveValue('');
});

test('malformed CSV stays unchanged in the read-only visual state', async ({ page }) => {
  await page.goto('/');
  for (const source of [
    'Radar Name,Category,Sub Category,Technology,Status,Dot Status\n"Unclosed,Platform,Runtime,Thing,Assess,Standard',
    'Name,Category,Sub Category,Technology,Status,Dot Status\nRadar,Platform,Runtime,Thing,Assess,Standard'
  ]) {
    await page.locator('#csvInput').fill(source);
    await page.locator('#visualMode').click();
    await expect(page.locator('#visualNotice')).toBeVisible();
    await expect(page.locator('#visualTable')).toBeHidden();
    await expect(page.locator('#csvInput')).toHaveValue(source);
    await page.locator('#switchToCsv').click();
    await expect(page.locator('#csvInput')).toHaveValue(source);
  }
});

test('visual controls remain reachable by keyboard at target widths', async ({ page }) => {
  await page.goto('/');
  const viewportChecks = [];
  for (const width of [360, 390, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('#visualMode').click();
    await expect(page.locator('#visualTableWrap')).toBeVisible();
    await expect(page.locator('#visualTable tbody tr').first()).toBeVisible();
    const firstCell = page.locator('#visualTable [aria-label="Radar Name, row 1"]');
    await firstCell.focus();
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'Category, row 1');
    viewportChecks.push(await page.evaluate(() => ({ width: innerWidth, pageWidth: document.documentElement.scrollWidth, tableViewport: document.querySelector('#visualTableWrap').clientWidth, tableContent: document.querySelector('#visualTableWrap').scrollWidth })));
    await page.locator('#csvMode').click();
  }
  console.log('V01 viewport checks:', JSON.stringify(viewportChecks));
});
