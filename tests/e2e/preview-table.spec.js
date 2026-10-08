import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const columns = ['Radar Name', 'Category', 'Sub Category', 'Technology', 'Status', 'Dot Status'];
const rows = [
  ['Alpha', 'Platform', 'Runtime', 'Alpha runtime', 'Assess', 'Standard'],
  ['Beta', 'Delivery', 'Build', 'Beta build', 'Sunset', 'Rejected'],
  ['Alpha', 'Platform', 'Data', 'Alpha data', 'Deploy', 'Caveated']
];
const csv = data => [columns, ...data].map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
const tableRows = page => page.locator('#technologyTable tbody tr').evaluateAll(elements => elements.map(row => [...row.cells].map(cell => cell.textContent)));

async function openPreview(page, data = rows) {
  await page.addInitScript(source => { if (!localStorage.getItem('radar-builder-source')) localStorage.setItem('radar-builder-source', source); }, csv(data));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#technologyTable tbody tr')).toHaveCount(data.length);
}

const editButton = (page, column, row = 1) => page.getByRole('button', { name: `Edit ${column}, preview row ${row}`, exact: true });
const editField = (page, column, row = 1) => page.getByLabel(`${column}, preview row ${row}`, { exact: true });

test('preview edits commit on blur, preserve hidden rows, persist and undo in one step', async ({ page }) => {
  await openPreview(page);
  await page.locator('#radarSelector select').selectOption('Alpha');
  const before = await page.locator('#csvInput').inputValue();
  await editButton(page, 'Technology', 3).click();
  const changed = 'Updated, "data"\n<svg onload=alert(1)>';
  await editField(page, 'Technology', 3).fill(changed);
  await expect(page.locator('#csvInput')).toHaveValue(before);
  await expect(page.locator('#radarCanvas .dot-label')).toHaveText(['Alpha runtime', 'Alpha data']);
  // A direct click into the next cell must both save and open that cell.
  await editButton(page, 'Status', 3).click();
  await expect(editField(page, 'Status', 3)).toBeFocused();
  await expect(page.locator('#radarCanvas .dot-label')).toHaveText(['Alpha runtime', changed]);
  const after = await page.locator('#csvInput').inputValue();
  expect(after).toContain('Beta,Delivery,Build,Beta build,Sunset,Rejected');
  expect(after).toContain('"Updated, ""data""\n<svg onload=alert(1)>"');
  expect(await page.evaluate(() => localStorage.getItem('radar-builder-source').replaceAll('\r\n', '\n'))).toBe(after);
  await editField(page, 'Status', 3).press('Escape');
  await page.locator('#undoButton').click();
  await expect(page.locator('#csvInput')).toHaveValue(before);
  await expect(page.locator('#radarCanvas .dot-label')).toHaveText(['Alpha runtime', 'Alpha data']);
  await page.locator('#redoButton').click();
  await expect(page.locator('#csvInput')).toHaveValue(after);
  await expect(page.locator('#radarCanvas .dot-label')).toHaveText(['Alpha runtime', changed]);
  await page.locator('.tab[data-tab="data"]').click();
  await page.locator('#visualMode').click();
  await expect(page.getByLabel('Technology, row 3', { exact: true })).toHaveValue(changed);
  await page.reload();
  await expect(page.locator('#technologyTable tbody')).toContainText(changed);
  await expect(page.locator('#technologyTable svg, #radarCanvas [onload]')).toHaveCount(0);
});

test('preview fields validate drafts, cancel with Escape and use configured status choices', async ({ page }) => {
  await openPreview(page);
  const before = await page.locator('#csvInput').inputValue();
  await editButton(page, 'Category').click();
  await editField(page, 'Category').fill('');
  await page.locator('#technologyTitle').click();
  await expect(editField(page, 'Category')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('.technology-cell-error')).toHaveText('Category cannot be empty.');
  await expect(page.locator('#csvInput')).toHaveValue(before);
  await editField(page, 'Category').press('Escape');
  await expect(editButton(page, 'Category')).toBeFocused();
  await editButton(page, 'Sub Category', 3).click();
  await editField(page, 'Sub Category', 3).fill('Runtime');
  await editField(page, 'Sub Category', 3).press('Enter');
  await expect(page.locator('#radarCanvas .subcategory-label')).toHaveText(['Runtime', 'Build']);
  await editButton(page, 'Status').click();
  await expect(editField(page, 'Status').locator('option')).toHaveText(['Assess', 'Trial', 'Deploy', 'Sunset', 'Decommission']);
  await editField(page, 'Status').selectOption('Decommission');
  await editField(page, 'Status').press('Tab');
  const radius = await page.locator('#radarCanvas g > circle').first().evaluate(dot => Math.hypot(Number(dot.getAttribute('cx')) - 340, Number(dot.getAttribute('cy')) - 350));
  expect(radius).toBeLessThan(50);
  await editButton(page, 'Dot Status').click();
  await expect(editField(page, 'Dot Status').locator('option')).toHaveText(['Standard', 'Caveated', 'Rejected']);
  await editField(page, 'Dot Status').selectOption('Rejected');
  await editField(page, 'Dot Status').press('Tab');
  await expect(page.locator('#radarCanvas g > circle').first()).toHaveAttribute('stroke', '#DC2626');
  await editButton(page, 'Category').click();
  await editField(page, 'Category').fill('New category');
  await editField(page, 'Category').press('Tab');
  await expect(page.locator('#radarCanvas .category-label')).toHaveText(['New category', 'Delivery', 'Platform']);
  await page.locator('#radarSelector select').selectOption('Beta');
  await editButton(page, 'Radar Name', 2).click();
  await editField(page, 'Radar Name', 2).fill('Renamed radar');
  await editField(page, 'Radar Name', 2).press('Enter');
  await expect(page.locator('#radarSelector select')).toHaveValue('');
  await expect(page.locator('#technologyTable tbody')).toContainText('Renamed radar');
  await expect(editButton(page, 'Radar Name', 2)).toBeFocused();
});

test('duplicate preview drafts and stale CSV cannot replace valid source; view links remain read-only', async ({ page }) => {
  await openPreview(page, [rows[0], [...rows[0].slice(0, 3), 'Other', ...rows[0].slice(4)]]);
  const before = await page.locator('#csvInput').inputValue();
  await editButton(page, 'Technology', 2).click();
  await editField(page, 'Technology', 2).fill(rows[0][3]);
  await editField(page, 'Technology', 2).press('Tab');
  await expect(page.locator('.technology-cell-error')).toHaveText('Duplicate technology entry.');
  await expect(page.locator('#csvInput')).toHaveValue(before);
  await editField(page, 'Technology', 2).press('Escape');
  await page.locator('.tab[data-tab="data"]').click();
  await page.locator('#csvInput').fill(`${before}\n"unclosed`);
  await expect(page.locator('#errorCount')).toHaveText('1');
  await page.locator('.tab[data-tab="preview"]').click();
  await expect(editButton(page, 'Technology')).toBeDisabled();
  await expect(page.locator('#technologyTableStatus')).toContainText('Showing the last valid version');
  await page.locator('.tab[data-tab="data"]').click();
  await page.locator('#csvInput').fill(before);
  await expect(page.locator('#errorCount')).toHaveText('0');
  await page.locator('#shareButton').click();
  await page.locator('[name="shareMode"][value="view"]').check();
  await page.locator('#generateShare').click();
  await expect(page.locator('#shareUrl')).not.toHaveValue('');
  const url = await page.locator('#shareUrl').inputValue();
  await page.goto(url);
  await page.reload();
  await expect(page.locator('#technologyTableHelp')).toContainText('view-only');
  await expect(editButton(page, 'Technology')).toBeDisabled();
});

test('curved outer categories contain separate subcategory slices and matching technology dots', async ({ page }) => {
  const data = [rows[0], rows[2], rows[1], ['Beta', 'Delivery', 'Runtime', 'Other runtime', 'Trial', 'Standard']];
  await openPreview(page, data);
  await expect(page.locator('.category-label textPath')).toHaveText(['Platform', 'Delivery']);
  await expect(page.locator('.subcategory-label textPath')).toHaveText(['Runtime', 'Data', 'Build', 'Runtime']);
  await expect(page.locator('.category-divider')).toHaveCount(2);
  await expect(page.locator('.subcategory-divider')).toHaveCount(2);
  const angles = await page.locator('#radarCanvas g > circle').evaluateAll(dots => dots.map(dot => {
    const angle = Math.atan2(Number(dot.getAttribute('cy')) - 350, Number(dot.getAttribute('cx')) - 340);
    return angle < -Math.PI / 2 ? angle + Math.PI * 2 : angle;
  }));
  for (let index = 0; index < 4; index += 1) {
    expect(angles[index]).toBeGreaterThan(-Math.PI / 2 + index * Math.PI / 2);
    expect(angles[index]).toBeLessThan(-Math.PI / 2 + (index + 1) * Math.PI / 2);
  }
  // Labels follow circular paths within the SVG, with outer categories beyond subcategories.
  const arcs = await page.locator('#radarCanvas textPath').evaluateAll(labels => labels.map(label => {
    const path = document.querySelector(label.getAttribute('href'));
    const length = path.getTotalLength(), middle = path.getPointAtLength(length / 2);
    const box = label.parentNode.getBBox();
    return { radius: Math.hypot(middle.x - 340, middle.y - 350), length, textLength: label.getComputedTextLength(), box: [box.x, box.y, box.x + box.width, box.y + box.height] };
  }));
  for (const arc of arcs) {
    expect(arc.length).toBeGreaterThan(arc.textLength);
    expect(arc.box[0]).toBeGreaterThanOrEqual(0); expect(arc.box[1]).toBeGreaterThanOrEqual(0);
    expect(arc.box[2]).toBeLessThanOrEqual(720); expect(arc.box[3]).toBeLessThanOrEqual(700);
  }
  expect(arcs[0].radius).toBeGreaterThan(arcs[1].radius);
});

test('technology table follows radar selection, visual edits and source history', async ({ page }) => {
  await openPreview(page);
  const table = page.getByRole('table', { name: 'Technologies — All radars', exact: true });
  await expect(table.getByRole('columnheader')).toHaveText(columns);
  await expect(table.getByRole('rowheader')).toHaveText(rows.map(row => row[3]));
  expect(await tableRows(page)).toEqual(rows);

  const selector = page.locator('#radarSelector select');
  await selector.selectOption('Alpha');
  await expect(page.getByRole('table', { name: 'Technologies — Alpha', exact: true })).toBeVisible();
  expect(await tableRows(page)).toEqual([rows[0], rows[2]]);
  await expect(page.locator('#radarCanvas .dot-label')).toHaveText(['Alpha runtime', 'Alpha data']);
  await page.locator('#resetView').click();
  expect(await tableRows(page)).toEqual(rows);

  await page.locator('.tab[data-tab="data"]').click();
  await page.locator('#visualMode').click();
  await page.locator('#visualRadarFilter').selectOption('Beta');
  const technology = page.getByRole('textbox', { name: 'Technology, row 2', exact: true });
  await technology.fill('Updated build');
  await technology.press('Tab');
  await expect(page.locator('#technologyTable tbody')).toContainText('Updated build');
  await page.locator('#visualTextFilter').fill('No matching technology');
  expect(await tableRows(page)).toEqual([[...rows[1].slice(0, 3), 'Updated build', ...rows[1].slice(4)]]);

  await page.locator('#undoButton').click();
  await expect(page.locator('#technologyTable tbody')).toContainText('Beta build');
  await page.locator('#redoButton').click();
  await expect(page.locator('#technologyTable tbody')).toContainText('Updated build');
  await page.locator('.tab[data-tab="preview"]').click();
  await expect(page.locator('#radarCanvas .dot-label')).toHaveText(['Updated build']);
});

test('invalid source retains the last valid table and valid empty source clears it', async ({ page }) => {
  await openPreview(page);
  await page.locator('.tab[data-tab="data"]').click();
  for (const source of [csv(rows).replace('Assess', 'Unknown status'), `${csv(rows)}\n"unclosed`]) {
    await page.locator('#csvInput').fill(source);
    await expect(page.locator('#errorCount')).toHaveText('1');
    await expect(page.locator('#technologyTableStatus')).toContainText('Showing the last valid version');
    expect(await tableRows(page)).toEqual(rows);
    await expect(page.locator('#radarCanvas .dot-label')).toHaveText(rows.map(row => row[3]));
    await page.locator('#csvInput').fill(csv(rows));
    await expect(page.locator('#errorCount')).toHaveText('0');
  }
  await page.locator('#csvInput').fill(csv([]));
  await expect(page.locator('#technologyTable tbody tr')).toHaveCount(0);
  await page.locator('.tab[data-tab="preview"]').click();
  await expect(page.locator('#technologyTableStatus')).toHaveText('0 technologies');
  await expect(page.locator('#technologyTableEmpty')).toBeVisible();
  await expect(page.locator('#radarCanvas .dot-label')).toHaveCount(0);
});

test('CSV text stays literal in table cells, captions and SVG labels', async ({ page }) => {
  const hostile = [[
    '<img src=x onerror=alert(1)> & "Radar"',
    '<svg onload=alert(2)>',
    'Sub, "quoted"\ncategory',
    '</text><script>alert(3)</script> & technology',
    'Trial', 'Caveated'
  ]];
  const dialogs = [];
  page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.dismiss(); });
  await openPreview(page, hostile);
  await page.locator('#radarSelector select').selectOption(hostile[0][0]);
  expect(await tableRows(page)).toEqual(hostile);
  await expect(page.locator('#technologyTable caption')).toHaveText(`Technologies — ${hostile[0][0]}`);
  await expect(page.locator('#technologyTable img, #technologyTable svg, #technologyTable script, #radarCanvas script')).toHaveCount(0);
  await expect(page.locator('#radarCanvas .dot-label')).toHaveText(hostile[0][3]);
  await expect(page.locator('#radarCanvas .category-label')).toHaveText(hostile[0][1]);
  expect(dialogs).toEqual([]);
});

for (const width of [360, 390, 768, 1024, 1280]) {
  test(`preview table is readable and keyboard accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const longRows = [[...rows[0]], [...rows[1]]];
    longRows[0][2] = 'LongUnbrokenSubcategory'.repeat(10);
    await openPreview(page, longRows);
    const selector = page.locator('#radarSelector select');
    await selector.focus();
    await selector.press('ArrowDown');
    await selector.press('Enter');
    await expect(selector).toHaveValue('Alpha');
    await expect(page.locator('#technologyTable tbody tr')).toHaveCount(1);
    await expect(page.locator('#technologyTable tbody')).toContainText(longRows[0][2]);
    await page.locator('#radarCanvas g[tabindex]').last().focus();
    await page.keyboard.press('Tab');
    const region = page.getByRole('region', { name: 'Technologies', exact: true });
    await expect(region).toBeFocused();
    await expect(region).toHaveCSS('outline-style', 'solid');
    await expect(region).toHaveAttribute('aria-describedby', 'technologyTableHelp');
    await expect(page.getByRole('table', { name: 'Technologies — Alpha', exact: true })).toBeVisible();
    const dimensions = await page.evaluate(() => {
      const wrap = document.querySelector('#technologyTableWrap');
      const svg = document.querySelector('#radarCanvas svg').getBoundingClientRect();
      return { page: document.documentElement.scrollWidth, viewport: innerWidth, tableViewport: wrap.clientWidth, tableWidth: wrap.scrollWidth, svgLeft: svg.left, svgRight: svg.right };
    });
    expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.svgLeft).toBeGreaterThanOrEqual(0);
    expect(dimensions.svgRight).toBeLessThanOrEqual(width);
    const labelBoxes = await page.locator('#radarCanvas .category-label, #radarCanvas .subcategory-label').evaluateAll(labels => labels.map(label => {
      const box = label.getBBox(); return [box.x, box.y, box.x + box.width, box.y + box.height];
    }));
    for (const box of labelBoxes) {
      expect(box[0]).toBeGreaterThanOrEqual(0); expect(box[1]).toBeGreaterThanOrEqual(0);
      expect(box[2]).toBeLessThanOrEqual(720); expect(box[3]).toBeLessThanOrEqual(700);
    }
    if (dimensions.tableWidth > dimensions.tableViewport) {
      await region.press('ArrowRight');
      await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
      await region.evaluate(element => { element.scrollLeft = element.scrollWidth; });
      const lastHeader = page.getByRole('columnheader', { name: 'Dot Status', exact: true });
      await expect(lastHeader).toBeInViewport();
    }
    await page.keyboard.press('Tab');
    await expect(region).not.toBeFocused();
    await expect(editButton(page, 'Radar Name')).toBeFocused();
    await editButton(page, 'Technology').focus();
    await page.keyboard.press('Enter');
    await expect(editField(page, 'Technology')).toBeFocused();
    await editField(page, 'Technology').fill(`Edited at ${width}px`);
    await page.keyboard.press('Tab');
    await expect(editButton(page, 'Status')).toBeFocused();
    await expect(page.locator('#radarCanvas .dot-label')).toHaveText(`Edited at ${width}px`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('only technology labels have backing in the preview and exports; labels can still be toggled', async ({ page }) => {
  await openPreview(page);
  await page.locator('#radarSelector select').selectOption('Alpha');
  const svg = page.locator('#radarCanvas svg');
  const dotPositions = await svg.locator('g > circle').evaluateAll(dots => dots.map(dot => [dot.getAttribute('cx'), dot.getAttribute('cy')]));
  const labels = svg.locator('.dot-label');
  for (const label of await labels.all()) {
    await expect(label).toHaveAttribute('filter', 'url(#radar-label-background)');
    await expect(label).toHaveCSS('fill', 'rgb(16, 42, 67)');
  }
  for (const label of await svg.locator('.category-label, .subcategory-label').all()) {
    await expect(label).not.toHaveAttribute('filter');
    await expect(label).toHaveCSS('filter', 'none');
  }
  for (const band of await svg.locator('.category-band').all()) await expect(band).toHaveAttribute('fill', 'none');
  const backing = svg.locator('#radar-label-background feFlood');
  await expect(backing).toHaveAttribute('flood-color', '#eeeeee');
  const opacity = Number(await backing.getAttribute('flood-opacity'));
  expect(opacity).toBeGreaterThan(0.5);
  expect(opacity).toBeLessThan(1);
  await page.locator('#toggleLabels').click();
  await expect(svg.locator('.dot-label')).toHaveCount(0);
  expect(await tableRows(page)).toEqual([rows[0], rows[2]]);
  await page.locator('#toggleLabels').click();
  await expect(svg.locator('.dot-label')).toHaveCount(2);
  expect(await svg.locator('g > circle').evaluateAll(dots => dots.map(dot => [dot.getAttribute('cx'), dot.getAttribute('cy')]))).toEqual(dotPositions);

  await page.locator('.tab[data-tab="exports"]').click();
  const svgDownload = page.waitForEvent('download');
  await page.locator('[data-export="svg"]').click();
  const exported = await svgDownload;
  expect(exported.suggestedFilename()).toBe('technology-radar.svg');
  const source = await readFile(await exported.path(), 'utf8');
  const standalone = await page.evaluate(async source => {
    const document = new DOMParser().parseFromString(source, 'image/svg+xml');
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
    await image.decode();
    return {
      errors: document.querySelectorAll('parsererror').length,
      viewBox: document.documentElement.getAttribute('viewBox'),
      filter: document.querySelector('feFlood')?.getAttribute('flood-opacity'),
      outerBackgrounds: document.querySelectorAll('.category-label[filter], .subcategory-label[filter], .category-band:not([fill="none"])').length,
      technologies: [...document.querySelectorAll('.dot-label')].map(label => label.textContent),
      curvedLabels: [...document.querySelectorAll('textPath')].map(label => ({ text: label.textContent, hasPath: !!document.querySelector(label.getAttribute('href')) })),
      imageWidth: image.naturalWidth
    };
  }, source);
  expect(standalone).toMatchObject({ errors: 0, viewBox: '0 0 720 700', filter: '0.85', outerBackgrounds: 0, technologies: ['Alpha runtime', 'Alpha data'] });
  expect(standalone.imageWidth).toBeGreaterThan(0);
  expect(standalone.curvedLabels).toEqual(['Platform', 'Runtime', 'Data'].map(text => ({ text, hasPath: true })));

  const pngDownload = page.waitForEvent('download');
  await page.locator('[data-export="png"]').click();
  const png = await pngDownload;
  expect(png.suggestedFilename()).toBe('technology-radar.png');
  const bytes = await readFile(await png.path());
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1640, 1140]);
});
