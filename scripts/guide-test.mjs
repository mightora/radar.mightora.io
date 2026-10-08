import { readFile } from 'node:fs/promises';
import { strict as assert } from 'node:assert';

const guide = await readFile('guide/index.html', 'utf8');
const html = await readFile('index.html', 'utf8');
const yaml = await readFile('public/config/radar-definition.yaml', 'utf8');
const example = await readFile('public/examples/power-platform.csv', 'utf8');
const app = await readFile('src/app.js', 'utf8');
const vocabulary = section => yaml.split(`${section}:`)[1].split(/^\S/m)[0];
const entries = section => [...vocabulary(section).matchAll(/  - id: (.+)\r?\n([\s\S]*?)(?=  - id:|$)/g)].map(([, id, fields]) => ({
  id: id.trim(),
  label: fields.match(/    label: (.+)/)[1].trim(),
  order: Number(fields.match(/    order: (.+)/)?.[1]),
  description: fields.match(/    description: (.+)/)?.[1].trim()
}));
const documentedStatuses = [...guide.matchAll(/<dt data-status-id="([^"]+)">([^<]+)<\/dt><dd>([^<]+)<\/dd>/g)]
  .map(([, id, label, description]) => ({ id, label, description }));
assert.deepEqual(documentedStatuses, entries('statuses').sort((a, b) => a.order - b.order).map(({ id, label, description }) => ({ id, label, description })), 'Guide ring labels, order and descriptions must match YAML');
assert.deepEqual([...guide.matchAll(/<dt data-dot-status-id="([^"]+)">([^<]+)<\/dt>/g)].map(([, id, label]) => ({ id, label })),
  entries('dotStatuses').map(({ id, label }) => ({ id, label })), 'Guide dot labels must match YAML');
assert.ok(guide.includes(example.split(/\r?\n/)[0]), 'Guide must document the exact CSV header');
const examplesSection = guide.match(/<section id="examples"[\s\S]*?<\/section>/)?.[0];
assert.ok(examplesSection, 'Guide must have a loading examples section');
for (const [, name] of app.matchAll(/'([^']+)': 'public\/examples\/[^']+\.csv'/g)) {
  assert.ok(examplesSection.includes(name.replaceAll('&', '&amp;')), `Guide must list example ${name} in the loading examples section`);
}
for (const component of ['header', 'author', 'footer']) assert.ok(guide.includes(`<mightora-${component}`));
assert.equal(guide.match(/<script>[\s\S]*?<\/script>/)[0], html.match(/<script>[\s\S]*?<\/script>/)[0], 'Guide must preserve the head footer-fetch patch');
assert.ok(guide.indexOf('js-yaml@4') < guide.indexOf('shared-ui@main/components.js'), 'Load YAML before shared components');
assert.ok(!guide.includes('src/app.js'), 'Guide must not start the editor or touch its local storage');
assert.ok(guide.includes('Anyone with this link can read the radar data. It is encoded and compressed, but it is not encrypted. Do not include confidential information.'));
console.log('Guide content checks passed.');
