import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const headers = ['Radar Name', 'Category', 'Sub Category', 'Technology', 'Status', 'Dot Status'];
const rows = [
  ['Alpha', 'Platform', 'Runtime', 'Alpha runtime', 'Assess', 'Standard'],
  ['Beta', 'Delivery', 'Build', '<script>alert(1)</script>\nBuild notes', 'Sunset', 'Rejected']
];
const csv = [headers, ...rows].map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');

function storedZipEntry(archive, entryName) {
  let offset = 0;
  while (offset + 30 <= archive.length && archive.readUInt32LE(offset) === 0x04034b50) {
    const size = archive.readUInt32LE(offset + 18), nameLength = archive.readUInt16LE(offset + 26), extraLength = archive.readUInt16LE(offset + 28);
    const nameStart = offset + 30, dataStart = nameStart + nameLength + extraLength;
    if (archive.toString('utf8', nameStart, nameStart + nameLength) === entryName) return archive.subarray(dataStart, dataStart + size);
    offset = dataStart + size;
  }
  throw new Error(`Missing DOCX entry: ${entryName}`);
}

test('Word export is keyboard accessible, editable, selected-radar-only, and escapes CSV markup', async ({ page }) => {
  await page.addInitScript(source => localStorage.setItem('radar-builder-source', source), csv);
  await page.goto('/');
  await expect(page.locator('#sourceStatus')).toHaveText('2 valid technologies', { timeout: 15000 });
  await expect(page.locator('#technologyTable tbody tr')).toHaveCount(rows.length);
  await page.locator('#radarSelector select').selectOption('Beta');
  await page.locator('.tab[data-tab="exports"]').click();
  const wordExport = page.locator('.export-card[data-export="word"]');
  await expect(wordExport).toBeVisible();
  await wordExport.focus();
  const downloadPromise = page.waitForEvent('download');
  await wordExport.press('Enter');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('technology-radar.docx');

  const document = await readFile(await download.path());
  expect(document.readUInt32LE(0)).toBe(0x04034b50);
  expect(document.includes(Buffer.from('word/document.xml'))).toBe(true);
  expect(document.includes(Buffer.from('word/_rels/document.xml.rels'))).toBe(true);
  expect(document.includes(Buffer.from('word/media/radar.png'))).toBe(true);
  const radarPng = storedZipEntry(document, 'word/media/radar.png');
  expect(radarPng.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  expect(Math.max(radarPng.readUInt32BE(16), radarPng.readUInt32BE(20))).toBe(4096);
  expect(document.includes(Buffer.from('<w:drawing>'))).toBe(true);
  expect(document.includes(Buffer.from('r:embed="rId1"'))).toBe(true);
  const documentXml = document.toString('utf8');
  expect(documentXml).toContain('Editable radar matrix');
  expect(documentXml).toContain('Status ring: Sunset');
  expect(documentXml).toContain('Technology');
  expect(documentXml).toContain('Beta');
  expect(documentXml).not.toContain('Alpha runtime');
  expect(documentXml).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  expect(documentXml).not.toContain('<script>alert(1)</script>');
  expect(documentXml).toContain('<w:br/>');
  expect(documentXml.match(/<w:tbl>/g)).toHaveLength(2);
});