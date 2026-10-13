import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const headers = 'Radar Name,Category,Sub Category,Technology,Status,Dot Status';
const source = [headers,
  'Shared Technology Radar,Platforms,Runtime,Alpha service,Assess,Standard',
  'Shared Technology Radar,Delivery,Build,Beta pipelines,Sunset,Rejected'
].join('\n');

function zipEntry(archive, entryName) {
  let offset = 0;
  while (offset + 30 <= archive.length && archive.readUInt32LE(offset) === 0x04034b50) {
    const length = archive.readUInt32LE(offset + 18);
    const nameLength = archive.readUInt16LE(offset + 26);
    const extraLength = archive.readUInt16LE(offset + 28);
    const dataStart = offset + 30 + nameLength + extraLength;
    const name = archive.toString('utf8', offset + 30, offset + 30 + nameLength);
    if (name === entryName) return archive.subarray(dataStart, dataStart + length).toString('utf8');
    offset = dataStart + length;
  }
  throw new Error('Missing PowerPoint file ' + entryName);
}

test('PowerPoint produces editable vector slides with preset and customised theme', async ({ page }) => {
  await page.route(/^https:\/\//, route => route.abort());
  await page.addInitScript(csv => localStorage.setItem('radar-builder-source', csv), source);
  await page.goto('/');
  await expect(page.locator('#sourceStatus')).toHaveText('2 valid technologies', { timeout: 15000 });
  await page.locator('.tab[data-tab="exports"]').click();
  const button = page.locator('[data-export="pptx"]');
  await button.focus();
  await button.press('Enter');
  await expect(page.locator('#pptxDialog')).toBeVisible();
  await page.locator('#pptxTheme').selectOption('ocean');
  await expect(page.locator('#pptx-background')).toHaveValue('#f0f8fd');
  await page.locator('#pptxFont').selectOption('custom');
  await page.locator('#pptxCustomFont').fill('Trebuchet MS');
  await page.locator('#pptx-accent').fill('#123456');
  await expect(page.locator('#pptxTheme')).toHaveValue('custom');
  const pending = page.waitForEvent('download');
  await page.locator('#exportPptx').click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('technology-radar.pptx');
  const archive = await readFile(await download.path());
  expect(archive.readUInt32LE(0)).toBe(0x04034b50);
  const presentation = zipEntry(archive, 'ppt/presentation.xml');
  const slide = zipEntry(archive, 'ppt/slides/slide2.xml');
  const detail = zipEntry(archive, 'ppt/slides/slide3.xml');
  const theme = zipEntry(archive, 'ppt/theme/theme1.xml');
  expect(presentation).toContain('screen16x9');
  expect(slide).toContain('Editable radar circle');
  expect(slide).toContain('Editable radar label');
  expect(slide).toContain('<a:custGeom>');
  expect(slide).not.toContain('<a:blip');
  expect(slide.match(/<p:sp>/g).length).toBeGreaterThan(20);
  expect(detail).toContain('Alpha service');
  expect(detail).toContain('Beta pipelines');
  expect(detail).toContain('Editable cell');
  expect(theme).toContain('123456');
  expect(theme).toContain('Trebuchet MS');
  expect(archive.includes(Buffer.from('ppt/media/'))).toBe(false);
  const parsed = await page.evaluate(xmls => xmls.map(xml => {
    const root = new DOMParser().parseFromString(xml, 'application/xml');
    return root.querySelectorAll('parsererror').length;
  }), [presentation, slide, detail, theme]);
  expect(parsed).toEqual([0, 0, 0, 0]);
});

test('Published radar link offers a read-only interactive landing without overwriting local data', async ({ page, browser }) => {
  await page.route(/^https:\/\//, route => route.abort());
  await page.addInitScript(csv => localStorage.setItem('radar-builder-source', csv), source);
  await page.goto('/');
  await expect(page.locator('#sourceStatus')).toHaveText('2 valid technologies', { timeout: 15000 });
  await page.locator('#publishButton').click();
  await expect(page.locator('[name=shareMode][value=publish]')).toBeChecked();
  await page.locator('#generateShare').click();
  const publishedUrl = await page.locator('#shareUrl').inputValue();
  expect(publishedUrl).toContain('#/publish/');
  const recipient = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const storedSource = headers + '\nPrivate Radar,Private,Internal,Keep me,Assess,Standard';
  await recipient.addInitScript(csv => localStorage.setItem('radar-builder-source', csv), storedSource);
  const guest = await recipient.newPage();
  await guest.route(/^https:\/\//, route => route.abort());
  await guest.goto(publishedUrl);
  await expect(guest.locator('#publishedLanding')).toBeVisible();
  await expect(guest.locator('#publishedTitle')).toHaveText('Shared Technology Radar');
  await expect(guest.locator('#technologyTable tbody tr')).toHaveCount(2);
  await expect(guest.locator('#publishedCount')).toHaveText('2 of 2 technologies');
  await expect(guest.locator('#dataPanel')).toBeHidden();
  expect(await guest.evaluate(() => localStorage.getItem('radar-builder-source'))).toBe(storedSource);
  await guest.locator('#publishSearch').fill('Alpha');
  await expect(guest.locator('#technologyTable tbody tr')).toHaveCount(1);
  await expect(guest.locator('#publishedCount')).toHaveText('1 of 2 technologies');
  await guest.locator('#publishReset').click();
  await guest.locator('#publishStatus').selectOption('Sunset');
  await expect(guest.locator('#technologyTable tbody tr')).toHaveCount(1);
  await expect(guest.locator('#technologyTable tbody')).toContainText('Beta pipelines');
  await guest.locator('#publishCategory').selectOption('Platforms');
  await expect(guest.locator('#technologyTable tbody tr')).toHaveCount(0);
  await guest.locator('#publishReset').focus();
  await guest.keyboard.press('Enter');
  await expect(guest.locator('#technologyTable tbody tr')).toHaveCount(2);
  await expect(guest.locator('#publishedLanding')).toBeVisible();
  await recipient.close();
});
