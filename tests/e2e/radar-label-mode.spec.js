import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const header = 'Radar Name,Category,Sub Category,Technology,Status,Dot Status';
const source = `${header}\nAlpha,Platform,Runtime,Alpha runtime,Assess,Standard\nBeta,Delivery,Build,<b>Build</b> & tools,Sunset,Rejected\nAlpha,Platform,Data,Alpha data,Deploy,Caveated`;

async function openRadar(page) {
  // This feature needs only local assets; external branding/fonts are not under test.
  await page.route(/^https:\/\//, route => route.abort());
  await page.addInitScript(csv => localStorage.setItem('radar-builder-source', csv), source);
  await page.goto('/');
  await expect(page.locator('#sourceStatus')).toHaveText('3 valid technologies');
  await page.evaluate(() => document.fonts.ready);
}

async function download(page, format) {
  const pending = page.waitForEvent('download');
  await page.locator(`[data-export="${format}"]`).click();
  return readFile(await (await pending).path());
}

function zipEntry(archive, name) {
  let offset = 0;
  while (archive.readUInt32LE(offset) === 0x04034b50) {
    const size = archive.readUInt32LE(offset + 18), length = archive.readUInt16LE(offset + 26);
    const start = offset + 30 + length + archive.readUInt16LE(offset + 28);
    if (archive.toString('utf8', offset + 30, offset + 30 + length) === name) return archive.subarray(start, start + size);
    offset = start + size;
  }
  throw new Error(`Missing ${name}`);
}

async function expectedPng(page, svg, width, height, sizeSvg = false) {
  return Buffer.from(await page.evaluate(async ({ svg, width, height, sizeSvg }) => {
    const root = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
    if (sizeSvg) { root.setAttribute('width', width); root.setAttribute('height', height); }
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sizeSvg ? new XMLSerializer().serializeToString(root) : svg)}`;
    await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    canvas.getContext('2d').drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/png').split(',')[1];
  }, { svg, width, height, sizeSvg }), 'base64');
}

for (const width of [360, 390, 768, 1024, 1280]) {
  test(`label mode supports keyboard, filtering and layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openRadar(page);
    const mode = page.getByRole('combobox', { name: 'Radar labels', exact: true });
    await expect(mode).toHaveValue('names');
    await mode.focus(); await mode.press('ArrowDown'); await mode.press('Enter');
    await expect(mode).toHaveValue('numbers');
    await expect(mode).toBeFocused();
    await expect(page.locator('.dot-label')).toHaveText(['1', '2', '3']);
    await expect(page.locator('.radar-number-key-entry')).toHaveCount(3);
    expect(await page.locator('.dot-number').evaluateAll(labels => labels.every(label => {
      const dot = label.previousElementSibling, bounds = label.getBBox();
      const x = Number(dot.getAttribute('cx')), y = Number(dot.getAttribute('cy')), radius = Number(dot.getAttribute('r'));
      return Number(label.getAttribute('x')) === x && Number(label.getAttribute('y')) === y && bounds.width < radius * 2 && bounds.height < radius * 2;
    }))).toBe(true);
    const slider = page.getByRole('slider', { name: 'Radar text size' });
    await slider.focus(); await slider.press('End');
    await expect(slider).toHaveValue('20');
    await expect(page.locator('#radarTextSizeValue')).toHaveText('20 px');
    expect(await page.locator('.dot-label, .category-label, .subcategory-label, .radar-number-key-entry').evaluateAll(labels => labels.every(label => parseFloat(getComputedStyle(label).fontSize) >= 18))).toBe(true);
    await slider.press('Home');
    await expect(slider).toHaveValue('8');
    expect(await page.locator('.dot-label, .category-label, .subcategory-label, .radar-number-key-entry').evaluateAll(labels => labels.every(label => parseFloat(getComputedStyle(label).fontSize) <= 8))).toBe(true);
    await expect(page.locator('.radar-number-key b')).toHaveCount(0);
    await page.locator('#radarSelector select').selectOption('Alpha');
    await expect(page.locator('.dot-label')).toHaveText(['1', '2']);
    await expect(page.locator('.radar-number-key-entry')).toHaveText(['1. Alpha runtime', '2. Alpha data']);
    await page.locator('#toggleLabels').click();
    await expect(page.locator('.dot-label, .radar-number-key')).toHaveCount(0);
    await page.locator('#toggleLabels').click();
    await expect(page.locator('.dot-label')).toHaveText(['1', '2']);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const box = await mode.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width);
    await mode.focus(); await mode.press('ArrowUp'); await mode.press('Enter');
    await expect(page.locator('.dot-label')).toHaveText(['Alpha runtime', 'Alpha data']);
    await expect(page.locator('.radar-number-key')).toHaveCount(0);
    expect(await page.locator('.dot-label').evaluateAll(labels => labels.every(label => !label.classList.contains('dot-number') && getComputedStyle(label).fontSize === '8px'))).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem('radar-builder-source'))).toBe(source);
  });
}

for (const mode of ['names', 'numbers']) {
  test(`${mode} carry through SVG, PNG, Word, project, print and image links`, async ({ page }) => {
    test.setTimeout(90000); // Six downloads plus image decoding on Windows.
    await openRadar(page);
    await page.getByRole('combobox', { name: 'Radar labels', exact: true }).selectOption(mode);
    await page.getByRole('slider', { name: 'Radar text size' }).focus();
    await page.getByRole('slider', { name: 'Radar text size' }).press('End');
    const svg = await page.locator('#radarCanvas svg').evaluate(node => node.outerHTML);
    await page.locator('[data-tab="exports"]').click();
    const exportedSvg = (await download(page, 'svg')).toString();
    expect(exportedSvg).toBe(svg);
    const png = await download(page, 'png');
    expect(png.equals(await expectedPng(page, svg, png.readUInt32BE(16), png.readUInt32BE(20))), 'PNG matches preview').toBe(true);
    const word = await download(page, 'word');
    expect(word.includes(Buffer.from('word/media/'))).toBe(false);
    const xml = zipEntry(word, 'word/document.xml').toString();
    expect(xml).toContain('<wpg:wgp>');
    expect(xml).toContain('<wps:txbx>');
    expect(xml).toContain('prst="ellipse"');
    expect(xml).not.toContain('<pic:pic>');
    expect(xml).toContain(mode === 'numbers' ? '2. &lt;b&gt;Build&lt;/b&gt; &amp; tools' : '&lt;b&gt;Build&lt;/b&gt; &amp; tools');
    const project = JSON.parse((await download(page, 'project')).toString());
    expect(project.configuration.labelMode).toBe(mode);
    expect(project.radarData.csv).toBe(source);
    expect((await download(page, 'csv')).toString()).toBe(source);
    await page.evaluate(() => { window.print = () => { window.printRequested = true; }; });
    await page.locator('[data-export="print"]').click();
    expect(await page.evaluate(() => window.printRequested)).toBe(true);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#radarCanvas svg')).toBeVisible();
    await expect(page.locator('#exportsPanel')).toBeHidden();
    expect(await page.locator('#radarCanvas svg').evaluate(node => node.outerHTML)).toBe(svg);
    await page.emulateMedia({ media: 'screen' });
    await page.locator('#shareButton').click();
    await page.locator('[name="shareMode"][value="image"]').check();
    await page.locator('[name="shareImageFormat"][value="svg"]').check();
    await page.locator('#generateShare').click();
    await expect(page.locator('#shareUrl')).toHaveValue(/^data:image\/svg\+xml/);
    const imageUrl = await page.locator('#shareUrl').inputValue();
    expect(Buffer.from(imageUrl.slice(imageUrl.indexOf(',') + 1), 'base64').toString()).toBe(svg);
  });
}

test('number key uses last-valid data, updates edits, and clears for empty data', async ({ page }) => {
  await openRadar(page);
  await page.getByRole('combobox', { name: 'Radar labels', exact: true }).selectOption('numbers');
  await page.getByRole('button', { name: 'Edit Technology, preview row 1', exact: true }).click();
  await page.getByLabel('Technology, preview row 1', { exact: true }).fill('Changed');
  await page.getByLabel('Technology, preview row 1', { exact: true }).press('Tab');
  await expect(page.locator('.radar-number-key-entry').first()).toHaveText('1. Changed (Alpha)');
  await page.locator('[data-tab="data"]').click();
  await page.locator('#csvMode').click();
  await page.locator('#csvInput').fill('invalid');
  await expect(page.locator('#errorCount')).toHaveText('1');
  await expect(page.locator('.dot-label')).toHaveText(['1', '2', '3']);
  await expect(page.locator('.radar-number-key-entry').first()).toHaveText('1. Changed (Alpha)');
  await page.locator('#csvInput').fill(header);
  await expect(page.locator('#errorCount')).toHaveText('0');
  await expect(page.locator('.dot-label, .radar-number-key')).toHaveCount(0);
});
