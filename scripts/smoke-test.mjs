import { readFile } from 'node:fs/promises';
import { strict as assert } from 'node:assert';

const app = await readFile('src/app.js', 'utf8');
const html = await readFile('index.html', 'utf8');
const yaml = await readFile('public/config/radar-definition.yaml', 'utf8');
const example = await readFile('public/examples/power-platform.csv', 'utf8');
const workflow = await readFile('.github/workflows/pages.yml', 'utf8');

const jobs = workflow.split(/^  (?:build|deploy):\r?$/m);
assert.equal(jobs.length, 3, 'Pages build and deployment must be separate jobs');
const [, build, deploy] = jobs;
assert.match(build, /run: npm run check/);
assert.match(build, /run: npm test/);
assert.match(build, /run: npm run build/);
assert.match(build, /uses: actions\/upload-pages-artifact@v3\s+with:\s+path: dist/);
assert.doesNotMatch(build, /actions\/(?:configure|deploy)-pages|pages: write|id-token: write/);
assert.match(deploy, /needs: build/);
assert.match(deploy, /pages: write/);
assert.match(deploy, /id-token: write/);
assert.match(deploy, /name: github-pages/);
assert.match(deploy, /url: \$\{\{ steps\.deployment\.outputs\.page_url \}\}/);
assert.match(deploy, /uses: actions\/configure-pages@v5/);
assert.match(deploy, /id: deployment\s+uses: actions\/deploy-pages@v4/);
assert.doesNotMatch(deploy, /continue-on-error: true|enablement: true/);

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
