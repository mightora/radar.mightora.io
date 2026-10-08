import { readFile } from 'node:fs/promises';
import { strict as assert } from 'node:assert';
import { radarSections, radarPoints, wrapRadarLabel } from '../src/radar-sections.js';

const crowdedRows = Array.from({ length: 24 }, (_, index) => ['Radar', 'Category', 'Subcategory', `Technology ${index}`, 'Inner', 'Standard']);
const testRings = [{ label: 'Outer' }, { label: 'Middle' }, { label: 'Inner' }];
const testSections = radarSections(crowdedRows, 0, 0, 250, value => value, 18);
assert.match(testSections.svg, /font-size="18"/);
for (const labelSize of [0, 100, 160]) {
	const labels = crowdedRows.map(() => ({ width: labelSize, height: labelSize ? 28 : 0 }));
	const layout = radarPoints(crowdedRows, testRings, testSections.positions, labels);
	assert.equal(layout.collisions, 0, 'Crowded dots and labels must not overlap');
	const occupied = [];
	layout.points.forEach(point => {
		const distance = Math.hypot(point.x, point.y);
		assert.ok(distance < layout.radius / 3 && distance >= 10, 'Points must stay in their status ring');
		assert.ok(Number.isFinite(point.labelX) && Number.isFinite(point.labelY));
		point.boxes.forEach(box => {
			occupied.forEach(previous => assert.ok(box.left >= previous.right || box.right <= previous.left || box.top >= previous.bottom || box.bottom <= previous.top, 'Actual dot and label bounds must not intersect'));
		});
		occupied.push(...point.boxes);
		if (labelSize) {
			const label = point.boxes[1];
			[label.left, label.right].forEach(horizontal => [label.top, label.bottom].forEach(vertical => assert.ok(Math.hypot(horizontal, vertical) <= layout.radius - 10, 'Technology labels must stay clear of the outer section labels')));
		}
	});
	assert.deepEqual(radarPoints(crowdedRows, testRings, testSections.positions, labels), layout, 'Placement must be deterministic');
}
assert.deepEqual(radarPoints([], testRings, new Map(), []).points, []);
const nestedRows = Array.from({ length: 32 }, (_, index) => ['Radar', `Category ${index % 4}`, `Subcategory ${index % 8}`, `Technology ${index}`, testRings[index % 3].label, 'Standard']);
const nestedSections = radarSections(nestedRows, 0, 0, 250, value => value);
const nestedLayout = radarPoints(nestedRows, testRings, nestedSections.positions, nestedRows.map(() => ({ width: 100, height: 24 })));
assert.equal(nestedLayout.collisions, 0);
nestedLayout.points.forEach((point, index) => {
	const section = nestedSections.positions.get(nestedRows[index][1]).get(nestedRows[index][2]);
	const angle = Math.atan2(point.y, point.x);
	const normalized = angle < section.start ? angle + Math.PI * 2 : angle;
	assert.ok(normalized >= section.start && normalized <= section.start + section.angle, 'Points must stay in their matching subsection');
});
const wrappedLabel = wrapRadarLabel('Long technology name\nAnother line <safe>', 20, text => text.length * 12);
assert.ok(wrappedLabel.lines.length >= 2);
assert.ok(wrappedLabel.width <= 246);
assert.equal(wrappedLabel.lines.join('').replaceAll(' ', ''), 'LongtechnologynameAnotherline<safe>');
console.log('Radar text-size and collision checks passed.');
await import('./guide-test.mjs');

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
