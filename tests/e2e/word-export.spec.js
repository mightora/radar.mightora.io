import { expect, test } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

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
  await page.route(/^https:\/\//, route => route.abort());
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
  await writeFile('test-results/editable-radar.docx', document);
  expect(document.readUInt32LE(0)).toBe(0x04034b50);
  expect(document.includes(Buffer.from('word/document.xml'))).toBe(true);
  expect(document.includes(Buffer.from('word/media/'))).toBe(false);
  const xml = storedZipEntry(document, 'word/document.xml').toString();
  const structure = await page.evaluate(xml => {
    const document = new DOMParser().parseFromString(xml, 'application/xml');
    const ns = 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape';
    const shapes = [...document.getElementsByTagNameNS(ns, 'wsp')];
    return { errors: document.getElementsByTagName('parsererror').length,
      shapes: shapes.length, textBoxes: document.getElementsByTagNameNS(ns, 'txbx').length,
      ids: shapes.map(shape => shape.firstElementChild.getAttribute('id')),
      text: document.documentElement.textContent };
  }, xml);
  expect(structure.errors).toBe(0);
  expect(structure.shapes).toBeGreaterThan(15);
  expect(structure.textBoxes).toBeGreaterThan(5);
  expect(new Set(structure.ids).size).toBe(structure.shapes);
  expect(structure.text).toContain('<script>alert(1)</script>');
  expect(xml).toContain('<wpg:wgp>');
  expect(xml).toContain('<wp:anchor');
  expect(xml).toContain('noUngrp="0"');
  expect(xml).toContain('prst="ellipse"');
  expect(xml).toContain('<a:custGeom>');
  expect(xml).not.toContain('<a:blip');
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