import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const header = 'Radar Name,Category,Sub Category,Technology,Status,Dot Status';
const alpha = 'Alpha,Platform,Runtime,First,Assess,Standard';
const beta = 'Beta,Data,Storage,Hidden,Trial,Caveated';
const last = 'Alpha,Platform,Runtime,Last,Deploy,Standard';
const csv = (...rows) => [header, ...rows].join('\n');
const visibleRows = page => page.locator('#visualTable tbody tr:not(.hidden)');

async function openVisual(page, source = csv(alpha, beta, last)) {
  await page.addInitScript(value => {
    localStorage.setItem('radar-builder-source', value);
    localStorage.setItem('radar-builder-editor-mode', 'visual');
  }, source);
  await page.goto('/');
  await expect(page.locator('#sourceStatus')).toHaveText(/valid technologies$/);
  await expect(page.locator('#visualTable')).toBeVisible();
}

async function expectSource(page, source) {
  await expect(page.locator('#csvInput')).toHaveValue(source);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('radar-builder-source')?.replaceAll('\r\n', '\n'))).toBe(source);
}

async function undoRedo(page, before, after) {
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expectSource(page, before);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expectSource(page, after);
}

test('row actions each have one undo step, duplicate validation and safe final deletion', async ({ page }) => {
  await openVisual(page, csv(alpha, beta));
  const snapshots = [csv(alpha, beta)];

  await expect(page.getByRole('button', { name: 'Move up row 1', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Move down row 2', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Move down row 1', exact: true }).click();
  snapshots.push(csv(beta, alpha));
  await expectSource(page, snapshots.at(-1));
  await undoRedo(page, snapshots.at(-2), snapshots.at(-1));
  await expect(page.getByLabel('Technology, row 1', { exact: true })).toHaveValue('Hidden');

  await page.getByRole('button', { name: 'Move up row 2', exact: true }).click();
  snapshots.push(csv(alpha, beta));
  await undoRedo(page, snapshots.at(-2), snapshots.at(-1));
  await expect(page.getByLabel('Technology, row 1', { exact: true })).toHaveValue('First');

  await page.getByRole('button', { name: 'Duplicate row 1', exact: true }).click();
  snapshots.push(csv(alpha, alpha, beta));
  await expect(page.locator('#errorCount')).toHaveText('1');
  await expect(page.getByLabel('Technology, row 2', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#visual-error-1-3')).toHaveText('Duplicate technology entry.');
  await expect(page.locator('#radarCanvas svg g[tabindex]')).toHaveCount(2);
  await undoRedo(page, snapshots.at(-2), snapshots.at(-1));
  await expect(page.locator('#errorCount')).toHaveText('1');

  await page.getByRole('button', { name: 'Delete row 2', exact: true }).click();
  snapshots.push(csv(alpha, beta));
  await expect(page.locator('#errorCount')).toHaveText('0');
  await undoRedo(page, snapshots.at(-2), snapshots.at(-1));
  await expect(page.locator('#visualTable tbody tr')).toHaveCount(2);

  await page.getByRole('button', { name: 'Add row', exact: true }).click();
  snapshots.push(csv(alpha, beta, ',,,,Assess,Standard'));
  await expect(page.getByLabel('Radar Name, row 3', { exact: true })).toBeFocused();
  await expect(page.locator('#errorCount')).toHaveText('4');
  await undoRedo(page, snapshots.at(-2), snapshots.at(-1));
  // Unwind the entire sequence: no extra snapshots from focus changes or table rebuilds.
  for (const snapshot of snapshots.slice(0, -1).reverse()) {
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expectSource(page, snapshot);
  }
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expectSource(page, snapshots[0]);
  await expect(page.locator('#visualTable tbody tr')).toHaveCount(2);

  await page.getByRole('button', { name: 'Delete row 2', exact: true }).click();
  await page.getByRole('button', { name: 'Delete row 1', exact: true }).click();
  await expectSource(page, header);
  await expect(page.locator('#errorCount')).toHaveText('0');
  await expect(page.locator('#sourceStatus')).toHaveText('0 valid technologies');
  await expect(page.locator('#visualFilterStatus')).toContainText('No rows yet');
  await expect(page.getByRole('button', { name: 'Add row', exact: true })).toBeFocused();
  await expect(page.locator('#radarSelector select option')).toHaveCount(1);
  await undoRedo(page, csv(alpha), header);
  await expect(page.locator('#visualTable tbody tr')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add row', exact: true }).click();
  await expectSource(page, csv(',,,,Assess,Standard'));
});

test('combined filters preserve hidden rows through edits, moves, duplication, deletion, downloads and sharing', async ({ page }) => {
  await openVisual(page);
  const textFilter = page.getByLabel('Filter rows', { exact: true });
  const radarFilter = page.getByRole('combobox', { name: 'Filter by radar', exact: true });
  await radarFilter.selectOption('Alpha');
  await textFilter.fill('  pLaTfOrM  ');
  await expect(visibleRows(page)).toHaveCount(2);
  await expect(page.locator('#visualFilterStatus')).toHaveText('2 of 3 rows shown.');
  await expect(page.locator('#radarSelector select')).toHaveValue('Alpha');
  await expectSource(page, csv(alpha, beta, last));

  await page.getByLabel('Technology, row 3', { exact: true }).fill('Changed');
  await page.getByLabel('Technology, row 3', { exact: true }).press('Tab');
  const changed = last.replace('Last', 'Changed');
  await expectSource(page, csv(alpha, beta, changed));
  await page.getByRole('button', { name: 'Move up row 3', exact: true }).click();
  await expectSource(page, csv(alpha, changed, beta));
  await expect(visibleRows(page)).toHaveCount(2);
  await page.getByRole('button', { name: 'Duplicate row 2', exact: true }).click();
  await expectSource(page, csv(alpha, changed, changed, beta));
  await expect(page.locator('#errorCount')).toHaveText('1');
  await page.getByRole('button', { name: 'Delete row 2', exact: true }).click();
  await expectSource(page, csv(alpha, changed, beta));
  await expect(page.locator('#errorCount')).toHaveText('0');

  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CSV', exact: true }).click();
  const download = await downloadEvent;
  expect((await readFile(await download.path(), 'utf8')).replaceAll('\r\n', '\n')).toBe(csv(alpha, changed, beta));
  await page.getByRole('button', { name: 'Share', exact: true }).first().click();
  await expect(page.locator('#shareDialog .warning')).toContainText('not encrypted');
  await page.locator('#generateShare').click();
  await expect(page.locator('#shareUrl')).not.toHaveValue('');
  const payload = await page.locator('#shareUrl').evaluate(async input => {
    const encoded = input.value.split('/view/')[1].replaceAll('-', '+').replaceAll('_', '/');
    const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
    return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text());
  });
  expect(payload).toEqual({ version: 1, csv: csv(alpha, changed, beta).replaceAll('\n', '\r\n'), mode: 'view', selectedRadarName: 'Alpha' });
  await page.locator('#cancelShare').click();

  await textFilter.fill('No match');
  await expect(visibleRows(page)).toHaveCount(0);
  await expect(page.locator('#visualFilterStatus')).toContainText('No matching rows');
  await expectSource(page, csv(alpha, changed, beta));
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(visibleRows(page)).toHaveCount(3);
  await page.locator('.tab[data-tab="preview"]').click();
  await page.locator('#radarSelector select').selectOption('Beta');
  await page.locator('.tab[data-tab="data"]').click();
  await expect(radarFilter).toHaveValue('Beta');
  await expect(visibleRows(page)).toHaveCount(1);
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expect(radarFilter).toHaveValue('');
  await expect(visibleRows(page)).toHaveCount(3);

  // Filtering does not write CSV or insert undo steps.
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expectSource(page, csv(alpha, changed, changed, beta));
});

test('add under filters uses YAML defaults and editing remains undoable before blur', async ({ page }) => {
  const configPath = new URL('../../public/config/radar-definition.yaml', import.meta.url);
  const config = (await readFile(configPath, 'utf8')).replace('label: Assess', 'label: Explore first').replace('label: Standard', 'label: Normal first');
  await page.route('**/public/config/radar-definition.yaml', route => route.fulfill({ body: config, contentType: 'text/yaml' }));
  const source = csv(beta);
  await openVisual(page, source);
  await page.getByRole('combobox', { name: 'Filter by radar', exact: true }).selectOption('Beta');
  await page.getByLabel('Filter rows', { exact: true }).fill('No match');
  await page.getByRole('button', { name: 'Add row', exact: true }).click();
  const added = csv(beta, 'Beta,,,,Explore first,Normal first');
  await expectSource(page, added);
  await expect(page.getByLabel('Filter rows', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Category, row 2', { exact: true })).toBeFocused();
  await expect(page.getByLabel('Status, row 2', { exact: true })).toHaveValue('Explore first');
  await expect(page.getByLabel('Dot Status, row 2', { exact: true })).toHaveValue('Normal first');
  await page.getByLabel('Category, row 2', { exact: true }).fill('New category');
  await page.keyboard.press('ControlOrMeta+z');
  await expectSource(page, added);
  await page.keyboard.press('ControlOrMeta+z');
  await expectSource(page, source);
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await expectSource(page, added);
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await expectSource(page, csv(beta, 'Beta,New category,,,Explore first,Normal first'));
});

test('row tools preserve quoted values and safely render radar filters', async ({ page }) => {
  const radar = '<img src=x onerror=alert(1)>';
  const special = `"${radar}",Platform,"Sub\ncategory","A, ""quoted""\nTechnology",Assess,Standard`;
  await openVisual(page, csv(special, beta));
  await page.getByRole('combobox', { name: 'Filter by radar', exact: true }).selectOption(radar);
  await expect(page.locator('#visualEditor img, #radarSelector img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Duplicate row 1', exact: true }).click();
  const serialized = special.replace(`"${radar}"`, radar);
  await expectSource(page, csv(serialized, serialized, beta));
  await expect(page.getByLabel('Technology, row 2', { exact: true })).toHaveValue('A, "quoted"\nTechnology');
  await page.getByRole('button', { name: 'Move down row 2', exact: true }).click();
  await expectSource(page, csv(serialized, beta, serialized));
  await page.getByRole('button', { name: 'Delete row 1', exact: true }).click();
  await expectSource(page, csv(beta, serialized));
  await expect(page.locator('#errorCount')).toHaveText('0');
});

test('malformed source blocks row tools; filtered-out edits retain focus until committed', async ({ page }) => {
  await openVisual(page);
  const filter = page.getByLabel('Filter rows', { exact: true });
  await filter.fill('First');
  const technology = page.getByLabel('Technology, row 1', { exact: true });
  await technology.fill('Changed');
  await expect(page.locator('#radarCanvas')).toContainText('Changed');
  await expect(technology).toBeFocused();
  await filter.focus();
  await expect(visibleRows(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await page.locator('#csvMode').click();
  for (const source of [header + '\n"unclosed', 'Incorrect,Headers']) {
    await page.locator('#csvInput').fill(source);
    await page.locator('#visualMode').click();
    await expect(page.locator('#visualNotice')).toBeVisible();
    await expect(page.locator('#visualTools')).toBeHidden();
    await expectSource(page, source);
    await page.locator('#switchToCsv').click();
  }
});

test('row tools support keyboard interaction at all five requested widths', async ({ page }, testInfo) => {
  await openVisual(page);
  const viewportChecks = [];
  for (const width of [360, 390, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const add = page.getByRole('button', { name: 'Add row', exact: true });
    await add.focus();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Filter rows', { exact: true })).toBeFocused();
    await page.keyboard.type('Last');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('combobox', { name: 'Filter by radar', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(visibleRows(page)).toHaveCount(1);
    await page.getByLabel('Dot Status, row 3', { exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Move up row 3', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Move up row 2', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Move down row 2', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Duplicate row 2', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Technology, row 3', { exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Delete row 3', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Technology, row 2', { exact: true })).toBeFocused();
    await expectSource(page, csv(alpha, last, beta));
    await page.getByRole('button', { name: 'Clear filters', exact: true }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Move down row 2', exact: true }).click();
    await expectSource(page, csv(alpha, beta, last));
    await add.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Radar Name, row 4', { exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Delete row 4', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expectSource(page, csv(alpha, beta, last));
    await page.getByLabel('Filter rows', { exact: true }).focus();
    const metrics = await page.evaluate(() => ({
      width: innerWidth, pageWidth: document.documentElement.scrollWidth,
      tableViewport: document.querySelector('#visualTableWrap').clientWidth,
      tableContent: document.querySelector('#visualTableWrap').scrollWidth,
      toolsWidth: document.querySelector('#visualTools').clientWidth,
      toolsContent: document.querySelector('#visualTools').scrollWidth
    }));
    expect(metrics.toolsContent).toBeLessThanOrEqual(metrics.toolsWidth);
    viewportChecks.push(metrics);
    await page.screenshot({ path: testInfo.outputPath(`v02-${width}.png`), fullPage: true });
  }
  console.log('V02 viewport checks:', JSON.stringify(viewportChecks));
});

test('M01 responsive layouts keep every panel and share dialog within the viewport', async ({ page }) => {
  await openVisual(page);
  const widths = [360, 390, 768, 1024, 1280];
  const validSource = csv(alpha, beta, last);

  for (const width of widths) {
    await page.setViewportSize({ width, height: 800 });
    const expectNoPageOverflow = async surface => {
      const dimensions = await page.evaluate(() => ({ width: innerWidth, pageWidth: document.documentElement.scrollWidth }));
      expect(dimensions.pageWidth, `${surface} at ${width}px`).toBeLessThanOrEqual(dimensions.width);
    };

    await page.locator('.tab[data-tab="data"]').click();
    await expect(page.locator('#visualTable')).toBeVisible();
    await expect(page.locator('#shareButton')).toBeVisible();
    await expectNoPageOverflow('visual editor');
    if (width <= 760) {
      await expect(page.locator('#visualTable tbody tr').first()).toHaveCSS('display', 'grid');
      await expect(page.locator('#visualTable tbody tr').first().locator('td').first()).toContainText('Radar Name');
      const touchHeight = await page.getByRole('button', { name: 'Add row', exact: true }).evaluate(button => button.getBoundingClientRect().height);
      expect(touchHeight).toBeGreaterThanOrEqual(44);
    } else {
      await expect(page.locator('#visualTable')).toHaveCSS('min-width', '1250px');
    }

    await page.locator('#csvMode').click();
    await expect(page.locator('#csvInput')).toBeVisible();
    await expectNoPageOverflow('CSV editor');
    if (width <= 760) await expect(page.locator('#csvInput')).toHaveCSS('font-size', '16px');

    await page.locator('.tab[data-tab="preview"]').click();
    await expect(page.locator('#radarCanvas svg')).toBeVisible();
    await expectNoPageOverflow('preview');

    await page.locator('#csvInput').fill(validSource + '\n"unclosed');
    await page.waitForTimeout(400);
    await page.locator('.tab[data-tab="validation"]').click();
    await expect(page.locator('#validationList .error')).toBeVisible();
    await expectNoPageOverflow('errors');

    await page.locator('#csvInput').fill(validSource);
    await page.waitForTimeout(400);
    await page.locator('.tab[data-tab="exports"]').click();
    await expect(page.locator('.export-card')).toHaveCount(5);
    await expectNoPageOverflow('exports');

    await page.getByRole('button', { name: 'Share', exact: true }).first().click();
    await expect(page.locator('#shareDialog')).toBeVisible();
    await expect(page.locator('#shareDialog .warning')).toContainText('not encrypted');
    await expectNoPageOverflow('share dialog');
    const dialog = await page.locator('#shareDialog').boundingBox();
    expect(dialog.x, `share dialog left edge at ${width}px`).toBeGreaterThanOrEqual(0);
    expect(dialog.x + dialog.width, `share dialog right edge at ${width}px`).toBeLessThanOrEqual(width);
    await page.locator('#cancelShare').click();
  }
});
