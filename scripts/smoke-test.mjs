import { readFile } from 'node:fs/promises';
import { strict as assert } from 'node:assert';

const app = await readFile('src/app.js', 'utf8');
const html = await readFile('index.html', 'utf8');
const yaml = await readFile('public/config/radar-definition.yaml', 'utf8');
const example = await readFile('public/examples/power-platform.csv', 'utf8');

assert.match(app, /function parseCsv\(/);
assert.match(app, /function validate\(/);
assert.match(app, /CompressionStream/);
assert.match(app, /DecompressionStream/);
assert.match(html, /id="csvInput"/);
assert.match(html, /id="radarCanvas"/);
assert.match(html, /id="shareDialog"/);
assert.match(yaml, /statuses:/);
assert.match(yaml, /dotStatuses:/);
assert.equal(example.split(/\r?\n/)[0], 'Radar Name,Category,Sub Category,Technology,Status,Dot Status');
assert.ok(example.includes('Power Automate'));
console.log('Smoke tests passed.');
