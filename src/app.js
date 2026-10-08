import { createPreviewTable } from './preview-table.js';
import { radarSections, radarPoints, wrapRadarLabel } from './radar-sections.js';

const REQUIRED = ['Radar Name', 'Category', 'Sub Category', 'Technology', 'Status', 'Dot Status'];
const EXAMPLE = `Radar Name,Category,Sub Category,Technology,Status,Dot Status\nPower Platform Radar,Model-driven Apps,UI,Model-driven Apps,Trial,Standard\nPower Platform Radar,Model-driven Apps,UI,Responsive Canvas,Trial,Standard\nPower Platform Radar,Model-driven Apps,UI,Unsupported UI,Sunset,Rejected\nPower Platform Radar,Power Automate,Automation,Cloud Automation,Assess,Standard\nPower Platform Radar,Power Automate,Automation,Power Automate,Deploy,Standard\nPower Platform Radar,Power Pages & Agents,Extensibility,Copilot Agents,Assess,Caveated\nPower Platform Radar,Power Pages & Agents,Extensibility,Power Pages,Deploy,Standard\nPower Platform Radar,UI Extensions,Controls,PCF Controls,Trial,Standard\nPower Platform Radar,UI Extensions,Controls,Low-code Plug-ins,Assess,Standard\nPower Platform Radar,Solutions & Build,Governance,Managed Solutions,Deploy,Standard\nPower Platform Radar,Solutions & Build,Governance,Native Git & Tests,Assess,Standard\nPower Platform Radar,Transaction Processing,Data,Custom Pages,Deploy,Standard\nPower Platform Radar,Transaction Processing,Data,Approvals,Deploy,Standard\nPower Platform Radar,Operational Data,Data,Fabric Links,Assess,Standard\nPower Platform Radar,Operational Data,Data,Elastic Tables,Assess,Standard\nPower Platform Radar,Analytics & Documents,Connectors,Custom APIs,Deploy,Standard\nPower Platform Radar,Connectors & APIs,Connectors,Giant Personal Flows,Decommission,Rejected`;
const EXAMPLE_FILES = {
  'Power Platform Radar': 'public/examples/power-platform.csv',
  'Software Development Radar': 'public/examples/software-development.csv',
  'Enterprise Architecture Radar': 'public/examples/enterprise-architecture.csv',
  'Cloud & DevOps Radar': 'public/examples/cloud-devops.csv',
  'Data & AI Radar': 'public/examples/data-ai.csv',
  'Cybersecurity Radar': 'public/examples/cybersecurity.csv',
  'Frontend Web Radar': 'public/examples/frontend-web.csv',
  'Microsoft Cloud Strategy Radar': 'public/examples/01-microsoft-cloud-strategy.csv',
  'Azure Platform Evolution Radar': 'public/examples/02-azure-platform-evolution.csv',
  'Microsoft 365 Roadmap Radar': 'public/examples/03-microsoft-365-roadmap.csv',
  'Power Platform Evolution Radar': 'public/examples/04-power-platform-evolution.csv',
  'AI Regulation & Governance Radar': 'public/examples/05-ai-regulation-governance.csv',
  'Data Protection & Privacy Radar': 'public/examples/06-data-protection-privacy.csv',
  'Financial Services Regulation Radar': 'public/examples/07-financial-services-regulation.csv',
  'Healthcare & Life Sciences Radar': 'public/examples/08-healthcare-life-sciences.csv',
  'Public Sector Accessibility Radar': 'public/examples/09-public-sector-accessibility.csv',
  'Sustainability & ESG Regulation Radar': 'public/examples/10-sustainability-esg-regulation.csv'
};
const state = { source: EXAMPLE, validRows: [], errors: [], config: null, history: [], future: [], labels: true, selectedRadar: '', dirty: false, timer: 0, editorMode: localStorage.getItem('radar-builder-editor-mode') || 'csv', visualTableSource: null, visualEditBefore: null, visualFilter: '' };
const $ = id => document.getElementById(id);
state.textSize = 11;
const radarTextContext = document.createElement('canvas').getContext('2d');
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const csvCell = value => /[",\r\n]/.test(value) ? `"${String(value).replaceAll('"', '""')}"` : String(value);
const csvString = rows => [REQUIRED, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
const updateTechnologyTable = createPreviewTable($('technologyTable'), REQUIRED, commitTechnologyEdit);

function parseCsv(source) {
  const output = [], current = [], cell = []; let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i], next = source[i + 1];
    if (char === '"' && quoted && next === '"') { cell.push('"'); i += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === ',' && !quoted) { current.push(cell.join('')); cell.length = 0; continue; }
    if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && next === '\n') i += 1; current.push(cell.join('')); cell.length = 0; if (current.some(Boolean)) output.push(current.splice(0)); continue; }
    cell.push(char);
  }
  if (quoted) throw new Error('Unclosed quoted value.');
  if (cell.length || current.length) { current.push(cell.join('')); output.push(current); }
  if (!output.length) throw new Error('The CSV is empty.');
  const header = output.shift();
  if (header.length !== REQUIRED.length || header.some((value, index) => value !== REQUIRED[index])) throw new Error(`Headers must be exactly: ${REQUIRED.join(',')}`);
  return output.map(row => REQUIRED.map((_, index) => row[index] ?? ''));
}

function validate(rows) {
  const errors = [], seen = new Set(); const statuses = state.config?.statuses.map(item => item.label) || ['Assess', 'Trial', 'Deploy', 'Decommission']; const dots = state.config?.dotStatuses.map(item => item.label) || ['Standard', 'Caveated', 'Rejected'];
  rows.forEach((row, index) => { const line = index + 2; if (row.length !== 6) errors.push({ line, message: 'Expected six columns.' }); if (!row[0]) errors.push({ line, column: 'Radar Name', message: 'Radar name cannot be empty.' }); if (!row[1]) errors.push({ line, column: 'Category', message: 'Category cannot be empty.' }); if (!row[2]) errors.push({ line, column: 'Sub Category', message: 'Subcategory cannot be empty.' }); if (!row[3]) errors.push({ line, column: 'Technology', message: 'Technology cannot be empty.' }); if (!statuses.includes(row[4])) errors.push({ line, column: 'Status', message: `Invalid value “${row[4]}”. Allowed: ${statuses.join(', ')}.` }); if (!dots.includes(row[5])) errors.push({ line, column: 'Dot Status', message: `Invalid value “${row[5]}”. Allowed: ${dots.join(', ')}.` }); const key = row.join('\u0000'); if (seen.has(key)) errors.push({ line, message: 'Duplicate technology entry.' }); seen.add(key); });
  return errors;
}

function parseYaml(text) { const config = { statuses: [], dotStatuses: [] }; let section = ''; let item = null; text.split(/\r?\n/).forEach(line => { const sectionMatch = line.match(/^(statuses|dotStatuses):/); if (sectionMatch) { section = sectionMatch[1]; return; } const itemMatch = line.match(/^\s+- id:\s*(.+)$/); if (itemMatch) { item = { id: itemMatch[1].trim() }; config[section].push(item); return; } const value = line.match(/^\s+(label|order|description|backgroundColor|borderColor|color|shape):\s*(.*)$/); if (value && item) item[value[1]] = value[2].replace(/^['"]|['"]$/g, ''); }); return config; }
async function loadConfig() { try { const response = await fetch('public/config/radar-definition.yaml'); state.config = parseYaml(await response.text()); } catch { state.config = parseYaml(`statuses:\n  - id: assess\n    label: Assess\n    order: 1\n    backgroundColor: #A9C9E8\n    borderColor: #6E9BC7\n  - id: trial\n    label: Trial\n    order: 2\n    backgroundColor: #DCEAF6\n    borderColor: #A9C9E8\n  - id: deploy\n    label: Deploy\n    order: 3\n    backgroundColor: #C7C68B\n    borderColor: #ADA96A\n  - id: sunset\n    label: Sunset\n    order: 4\n    backgroundColor: #EFD469\n    borderColor: #D9B93F\n  - id: decommission\n    label: Decommission\n    order: 5\n    backgroundColor: #D9705B\n    borderColor: #C24E37\ndotStatuses:\n  - id: standard\n    label: Standard\n    color: #111827\n    shape: circle\n  - id: caveated\n    label: Caveated\n    color: #2563EB\n    shape: circle\n  - id: rejected\n    label: Rejected\n    color: #DC2626\n    shape: ring`); } }
function setSource(source, addHistory = true) { if (addHistory && state.source !== source) { state.history.push(state.source); if (state.history.length > 50) state.history.shift(); state.future = []; } state.source = source; state.dirty = true; $('csvInput').value = source; localStorage.setItem('radar-builder-source', source); updateLineNumbers(); clearTimeout(state.timer); state.timer = setTimeout(parseSource, 300); }
function parseSource() { try { const rows = parseCsv(state.source); state.errors = validate(rows); if (!state.errors.length) state.validRows = rows; render(); } catch (error) { state.errors = [{ line: 1, message: error.message }]; render(); } }
function updateLineNumbers() { $('lineNumbers').textContent = state.source.split('\n').map((_, index) => index + 1).join('\n'); }
function renderErrors() { $('errorCount').textContent = state.errors.length; $('validationList').innerHTML = state.errors.length ? state.errors.map(error => `<div class="validation-item error"><strong>Line ${error.line}${error.column ? ` / ${escapeHtml(error.column)}` : ''}</strong> ${escapeHtml(error.message)}</div>`).join('') : '<div class="validation-item">No validation errors. Preview is current.</div>'; $('sourceStatus').textContent = state.errors.length ? 'Preview is showing the last valid version. Source was not discarded.' : `${state.validRows.length} valid technologies`; }
function radarRows() { return state.validRows.filter(row => !state.selectedRadar || row[0] === state.selectedRadar); }
function commitTechnologyEdit(rowIndex, columnIndex, value, original) {
  let rows;
  try { rows = parseCsv(state.source); } catch { return 'Fix the CSV source errors in Editor before editing the preview.'; }
  if (state.errors.length || JSON.stringify(rows) !== JSON.stringify(state.validRows) || rows[rowIndex]?.[columnIndex] !== original) return 'The source has changed. Fix any source errors and try again.';
  rows[rowIndex][columnIndex] = value;
  const errors = validate(rows);
  if (errors.length) return errors.map(error => error.message).join(' ');
  return () => {
    finishVisualEdit();
    setSource(csvString(rows));
    clearTimeout(state.timer); parseSource();
  };
}
function renderTechnologyTable(rows) {
  const readOnly = $('dataPanel').classList.contains('hidden');
  updateTechnologyTable(rows.map(values => ({ values, index: state.validRows.indexOf(values) })), {
    selectedRadar: state.selectedRadar, editable: !state.errors.length && !readOnly,
    statuses: state.config?.statuses || [], dotStatuses: state.config?.dotStatuses || []
  });
  $('technologyTableHelp').textContent = `${readOnly ? 'This shared radar is view-only. ' : 'Click a value or focus it and press Enter to edit. Click outside or press Tab to save and update the radar; Escape cancels. Shift+Enter adds a new line. '}Scroll horizontally to see all columns on smaller screens. With the table focused, use the left and right arrow keys.`;
  $('technologyTableStatus').textContent = `${rows.length} ${rows.length === 1 ? 'technology' : 'technologies'}${state.errors.length ? ' · Showing the last valid version. Fix source errors to update the radar and table.' : ''}`;
  $('technologyTableEmpty').classList.toggle('hidden', rows.length > 0);
}
function renderPreview() {
  const rows = radarRows();
  const config = state.config || { statuses: [], dotStatuses: [] };
  const rings = config.statuses.length ? [...config.statuses].sort((a, b) => Number(a.order) - Number(b.order)) : [{ label: 'Assess' }, { label: 'Trial' }, { label: 'Deploy' }, { label: 'Decommission' }];
  radarTextContext.font = `600 ${state.textSize}px Manrope,sans-serif`;
  const labels = rows.map(row => state.labels ? wrapRadarLabel(row[3], state.textSize, text => radarTextContext.measureText(text).width) : { lines: [], width: 0, height: 0 });
  const positions = radarSections(rows, 0, 0, 250, escapeHtml).positions;
  const layout = radarPoints(rows, rings, positions, labels);
  const max = layout.radius, edge = max + Math.max(66, state.textSize * 4);
  const left = Math.min(-edge, ...layout.points.map(point => point.boxes[1]?.left ?? point.x));
  const right = Math.max(edge, ...layout.points.map(point => point.boxes[1]?.right ?? point.x));
  const top = Math.min(-edge, ...layout.points.map(point => point.boxes[1]?.top ?? point.y));
  const bottom = Math.max(edge, ...layout.points.map(point => point.boxes[1]?.bottom ?? point.y));
  const width = Math.max(720, right - left + 40), height = Math.max(700, bottom - top + 40);
  const cx = -left + (width - (right - left)) / 2, cy = -top + (height - (bottom - top)) / 2;
  const step = max / rings.length;
  const ringSvg = rings.map((ring, index) => `<circle cx="${cx}" cy="${cy}" r="${max - index * step}" fill="${ring.backgroundColor || '#fff'}" stroke="#10284314"/>`).join('');
  const boundary = `<circle cx="${cx}" cy="${cy}" r="${max + 12}" fill="none" stroke="#4b5563" stroke-width="9"/>`;
  const sections = radarSections(rows, cx, cy, max, escapeHtml, state.textSize);
  const dots = rows.map((row, index) => {
    const point = layout.points[index], x = cx + point.x, y = cy + point.y;
    const labelX = cx + point.labelX, labelY = cy + point.labelY + state.textSize;
    const dot = config.dotStatuses.find(item => item.label === row[5]) || {};
    const color = dot.color || '#111827';
    const shape = dot.shape === 'ring' ? `<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="${color}" stroke-width="3"/>` : `<circle cx="${x}" cy="${y}" r="7" fill="${color}"/>`;
    const label = state.labels ? `<text x="${labelX}" y="${labelY}" class="dot-label" font-family="Manrope,sans-serif" font-size="${state.textSize}" font-weight="600" fill="#102a43" filter="url(#radar-label-background)">${labels[index].lines.map((line, lineIndex) => `<tspan x="${labelX}" dy="${lineIndex ? state.textSize * 1.3 : 0}">${escapeHtml(line)}</tspan>`).join('')}</text>` : '';
    return `<g tabindex="0"><title>${escapeHtml(row.join(' / '))}</title>${shape}${label}</g>`;
  }).join('');
  const ringLegend = rings.map(ring => `<span><i style="background:${ring.backgroundColor || '#fff'}"></i>${escapeHtml(ring.label)}</span>`).join('');
  const dotLegend = config.dotStatuses.map(item => `<span><i class="dot" style="${item.shape === 'ring' ? `background:#fff;border:3px solid ${item.color}` : `background:${item.color}`}"></i>${escapeHtml(item.label)}</span>`).join('');
  const title = state.selectedRadar || rows[0]?.[0] || 'Technology Radar';
  $('previewTitle').textContent = title;
  // Keep label backing and fallback typography inside the SVG for standalone exports.
  const labelBackground = '<defs><filter id="radar-label-background" x="-3%" y="-12%" width="106%" height="124%" color-interpolation-filters="sRGB"><feFlood flood-color="#eeeeee" flood-opacity="0.85"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  $('radarCanvas').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="radar-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)} radar"><title>${escapeHtml(title)}</title>${labelBackground}${ringSvg}${boundary}${sections.svg}${dots}</svg><div class="legend"><h3>Status</h3>${ringLegend}<h3>Dot status</h3>${dotLegend}</div>`;
  renderTechnologyTable(rows);
}
function renderRadarSelector() {
  let sourceRows = []; try { sourceRows = parseCsv(state.source); } catch { /* Keep the last valid preview's choices. */ }
  const names = [...new Set([...sourceRows, ...state.validRows].map(row => row[0]).filter(Boolean))];
  if (!names.includes(state.selectedRadar)) state.selectedRadar = '';
  let label = $('radarSelector');
  if (!label) { label = makeElement('label', '', 'Radar '); label.id = 'radarSelector'; const select = makeElement('select'); select.addEventListener('change', event => selectRadar(event.target.value)); label.append(select); $('previewTitle').after(label); }
  [label.querySelector('select'), $('visualRadarFilter')].forEach(select => {
    select.replaceChildren();
    ['', ...names].forEach(name => { const option = makeElement('option', '', name || 'All radars'); option.value = name; select.append(option); });
    select.value = state.selectedRadar;
  });
}
function selectRadar(name) { state.selectedRadar = name; renderRadarSelector(); renderPreview(); applyVisualFilters(); }
function render() { renderErrors(); renderRadarSelector(); renderPreview(); updateLineNumbers(); if (state.editorMode === 'visual') { if (state.visualTableSource !== state.source) renderVisualEditor(); else { updateVisualErrors(); applyVisualFilters(); } } }
function setEditorMode(mode, refresh = true) { state.editorMode = mode; localStorage.setItem('radar-builder-editor-mode', mode); $('visualMode').classList.toggle('active', mode === 'visual'); $('csvMode').classList.toggle('active', mode === 'csv'); $('visualMode').setAttribute('aria-pressed', String(mode === 'visual')); $('csvMode').setAttribute('aria-pressed', String(mode === 'csv')); $('visualEditor').classList.toggle('hidden', mode !== 'visual'); $('codeEditor').classList.toggle('hidden', mode !== 'csv'); $('sourceActions').classList.toggle('hidden', mode !== 'csv'); $('formatCsv').classList.toggle('hidden', mode !== 'csv'); if (mode === 'visual' && refresh) renderVisualEditor(); }
function makeElement(tag, className, text) { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; }
function renderVisualEditor() {
  const table = $('visualTable'), notice = $('visualNotice'); let rows;
  try { rows = parseCsv(state.source); }
  catch (error) { table.replaceChildren(); table.classList.add('hidden'); $('visualTools').classList.add('hidden'); $('visualFilterStatus').textContent = ''; notice.classList.remove('hidden'); $('visualNoticeText').textContent = `${error.message} The source is unchanged.`; state.visualTableSource = state.source; return; }
  notice.classList.add('hidden'); $('visualTools').classList.remove('hidden'); table.classList.remove('hidden'); table.replaceChildren();
  $('visualEditor').querySelectorAll('datalist').forEach(list => list.remove());
  const datalists = { 0: 'radarNames', 1: 'categories', 2: 'subCategories' };
  Object.entries(datalists).forEach(([column, id]) => {
    const list = makeElement('datalist'); list.id = id;
    [...new Set(rows.map(row => row[Number(column)]).filter(Boolean))].forEach(value => { const option = makeElement('option'); option.value = value; list.append(option); });
    $('visualEditor').append(list);
  });
  const head = makeElement('thead'), headerRow = makeElement('tr');
  [...REQUIRED, 'Row actions'].forEach(label => { const heading = makeElement('th', '', label); heading.scope = 'col'; headerRow.append(heading); });
  head.append(headerRow); table.append(head); const body = makeElement('tbody');
  rows.forEach((row, rowIndex) => {
    const tableRow = makeElement('tr'); tableRow.dataset.rowIndex = rowIndex;
    REQUIRED.forEach((label, columnIndex) => {
      const cell = makeElement('td'), error = makeElement('span', 'visual-cell-error'); cell.dataset.label = label;
      error.id = `visual-error-${rowIndex}-${columnIndex}`; error.setAttribute('aria-live', 'polite'); let control;
      if (columnIndex < 4) {
        if (/[\r\n]/.test(row[columnIndex])) { control = makeElement('textarea', 'visual-textarea'); control.rows = 1; control.value = row[columnIndex]; }
        else { control = makeElement('input', 'visual-input'); control.type = 'text'; control.value = row[columnIndex]; if (datalists[columnIndex]) control.setAttribute('list', datalists[columnIndex]); }
      } else {
        control = makeElement('select', 'visual-select'); const choices = columnIndex === 4 ? state.config?.statuses || [] : state.config?.dotStatuses || [];
        if (!choices.some(item => item.label === row[columnIndex])) { const invalid = makeElement('option', '', `Invalid: ${row[columnIndex]}`); invalid.value = row[columnIndex]; control.append(invalid); }
        choices.forEach(item => { const option = makeElement('option', '', item.label); option.value = item.label; control.append(option); }); control.value = row[columnIndex];
      }
      control.dataset.columnIndex = columnIndex; control.setAttribute('aria-label', `${label}, row ${rowIndex + 1}`); cell.append(control, error); tableRow.append(cell);
    });
    const actions = makeElement('td', 'visual-row-actions'); actions.dataset.label = 'Row actions';
    [['up', 'Move up', '\u2191'], ['down', 'Move down', '\u2193'], ['duplicate', 'Duplicate', '\u29c9'], ['delete', 'Delete', '\u00d7']].forEach(([action, label, icon]) => {
      const button = makeElement('button', 'icon-button', icon); button.type = 'button'; button.dataset.rowAction = action;
      button.setAttribute('aria-label', `${label} row ${rowIndex + 1}`); button.title = `${label} row ${rowIndex + 1}`;
      button.disabled = (action === 'up' && rowIndex === 0) || (action === 'down' && rowIndex === rows.length - 1); actions.append(button);
    });
    tableRow.append(actions); body.append(tableRow);
  });
  table.append(body); state.visualTableSource = state.source; updateVisualErrors(); applyVisualFilters();
}
function applyVisualFilters() {
  if ($('visualTable').classList.contains('hidden')) return;
  const rows = [...$('visualTable').querySelectorAll('tbody tr')], query = state.visualFilter.trim().toLowerCase(); let visible = 0;
  rows.forEach(row => {
    const values = [...row.querySelectorAll('[data-column-index]')].map(control => control.value);
    const matches = (!state.selectedRadar || values[0] === state.selectedRadar) && (!query || values.some(value => value.toLowerCase().includes(query)));
    // Finish typing before an edited value can hide its own row.
    const editing = row.contains(document.activeElement) && document.activeElement.matches('[data-column-index]');
    row.classList.toggle('hidden', !matches && !editing); if (matches || editing) visible += 1;
  });
  $('visualFilterStatus').textContent = rows.length ? `${visible} of ${rows.length} rows shown.${visible ? '' : ' No matching rows. Clear filters to see all rows.'}` : 'No rows yet. Add a row to get started.';
}
function finishVisualEdit() {
  if (state.visualEditBefore !== null && state.visualEditBefore !== state.source) { state.history.push(state.visualEditBefore); if (state.history.length > 50) state.history.shift(); state.future = []; }
  state.visualEditBefore = null;
}
function changeVisualRow(action, rowIndex) {
  let rows; try { rows = parseCsv(state.source); } catch { return; }
  finishVisualEdit(); let focusIndex = rowIndex, focusColumn = 3;
  if (action === 'add') {
    rows.push([state.selectedRadar, '', '', '', state.config?.statuses[0]?.label || '', state.config?.dotStatuses[0]?.label || '']);
    focusIndex = rows.length - 1; focusColumn = state.selectedRadar ? 1 : 0;
    state.visualFilter = ''; $('visualTextFilter').value = '';
  } else {
    if (!Number.isInteger(rowIndex) || !rows[rowIndex]) return;
    if (action === 'delete') rows.splice(rowIndex, 1);
    else if (action === 'duplicate') { rows.splice(rowIndex + 1, 0, [...rows[rowIndex]]); focusIndex += 1; }
    else if (action === 'up' || action === 'down') {
      const destination = rowIndex + (action === 'up' ? -1 : 1); if (!rows[destination]) return;
      [rows[rowIndex], rows[destination]] = [rows[destination], rows[rowIndex]]; focusIndex = destination;
    } else return;
  }
  // Always serialize the full source, including rows hidden by either filter.
  setSource(csvString(rows)); renderRadarSelector(); renderVisualEditor();
  const visibleRows = [...$('visualTable').querySelectorAll('tbody tr:not(.hidden)')];
  const target = visibleRows.find(row => Number(row.dataset.rowIndex) >= focusIndex) || visibleRows.at(-1);
  const moveButton = (action === 'up' || action === 'down') && target?.querySelector(`[data-row-action="${action}"]:not(:disabled)`);
  (moveButton || target?.querySelector(`[data-column-index="${focusColumn}"]`) || $('addVisualRow')).focus();
}
function updateVisualErrors() {
  const table = $('visualTable'); if (!table || table.classList.contains('hidden')) return; const errors = new Map();
  state.errors.forEach(error => {
    const rowIndex = error.line - 2; if (rowIndex < 0) return;
    const columns = error.column ? [REQUIRED.indexOf(error.column)] : REQUIRED.map((_, index) => index);
    columns.filter(index => index >= 0).forEach(columnIndex => { const key = `${rowIndex}-${columnIndex}`; errors.set(key, [...(errors.get(key) || []), error.message]); });
  });
  table.querySelectorAll('[data-column-index]').forEach(control => {
    const key = `${control.closest('tr').dataset.rowIndex}-${control.dataset.columnIndex}`, messages = errors.get(key) || [], error = $(`visual-error-${key}`);
    error.textContent = messages.join(' '); error.classList.toggle('visible', messages.length > 0); control.closest('td').classList.toggle('has-error', messages.length > 0);
    if (messages.length) { control.setAttribute('aria-invalid', 'true'); control.setAttribute('aria-describedby', error.id); } else { control.removeAttribute('aria-invalid'); control.removeAttribute('aria-describedby'); }
  });
}
function download(name, content, type) { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type })); link.download = name; link.click(); URL.revokeObjectURL(link.href); }
function showToast(message) { $('toast').textContent = message; $('toast').classList.add('show'); setTimeout(() => $('toast').classList.remove('show'), 2500); }
function toBase64(bytes) { let binary = ''; bytes.forEach(byte => { binary += String.fromCharCode(byte); }); return btoa(binary); }
async function encodeShare(mode) { const payload = JSON.stringify({ version: 1, csv: state.source, selectedRadarName: state.selectedRadar || undefined, mode, table: mode === 'embed' ? $('shareIncludeTable').checked : undefined }); const stream = new Blob([new TextEncoder().encode(payload)]).stream().pipeThrough(new CompressionStream('deflate-raw')); const bytes = new Uint8Array(await new Response(stream).arrayBuffer()); return `${location.origin}${location.pathname}#/${mode}/${toBase64(bytes).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')}`; }
async function radarImageUrl(format) {
  const svgUrl = `data:image/svg+xml;base64,${toBase64(new TextEncoder().encode($('radarCanvas').querySelector('svg').outerHTML))}`;
  if (format === 'svg') return svgUrl;
  const image = new Image(); image.src = svgUrl; await image.decode();
  const canvas = document.createElement('canvas'); canvas.width = 1440; canvas.height = 1400;
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}
function updateShareOptions() { const mode = document.querySelector('[name=shareMode]:checked').value; $('shareEmbedOptions').classList.toggle('hidden', mode !== 'embed'); $('shareImageOptions').classList.toggle('hidden', mode !== 'image'); }
async function decodeShare(value) { const binary = atob(value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4)); const bytes = Uint8Array.from(binary, char => char.charCodeAt(0)); const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')); return JSON.parse(new TextDecoder().decode(await new Response(stream).arrayBuffer())); }
function openTab(name) { document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === name)); document.querySelectorAll('.workspace-panel').forEach(panel => panel.classList.toggle('active-panel', panel.id === `${name}Panel`)); }

Object.entries(EXAMPLE_FILES).forEach(([name]) => { const option = document.createElement('option'); option.value = name; option.textContent = name; $('examples').append(option); });
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => openTab(tab.dataset.tab))); $('visualMode').addEventListener('click', () => setEditorMode('visual')); $('csvMode').addEventListener('click', () => setEditorMode('csv')); $('switchToCsv').addEventListener('click', () => setEditorMode('csv'));
$('visualTextFilter').addEventListener('input', event => { state.visualFilter = event.target.value; applyVisualFilters(); });
$('visualRadarFilter').addEventListener('change', event => selectRadar(event.target.value));
$('clearVisualFilters').addEventListener('click', () => { state.visualFilter = ''; $('visualTextFilter').value = ''; selectRadar(''); });
$('addVisualRow').addEventListener('click', () => changeVisualRow('add'));
$('visualTable').addEventListener('click', event => { const button = event.target.closest('[data-row-action]'); if (button) changeVisualRow(button.dataset.rowAction, Number(button.closest('tr').dataset.rowIndex)); });
$('visualTable').addEventListener('focusin', event => { if (event.target.matches('[data-column-index]') && state.visualEditBefore === null) state.visualEditBefore = state.source; });
$('visualTable').addEventListener('input', event => {
  if (!event.target.matches('[data-column-index]')) return;
  let rows; try { rows = parseCsv(state.source); } catch { return; }
  const rowIndex = Number(event.target.closest('tr').dataset.rowIndex); if (!rows[rowIndex]) return;
  rows[rowIndex][Number(event.target.dataset.columnIndex)] = event.target.value;
  const source = csvString(rows); setSource(source, false); state.visualTableSource = source;
});
$('visualTable').addEventListener('focusout', () => { finishVisualEdit(); applyVisualFilters(); });
setEditorMode(state.editorMode, false);
$('radarTextSize').addEventListener('input', event => {
  state.textSize = Math.max(8, Math.min(20, Number(event.target.value) || 11));
  $('radarTextSizeValue').value = `${state.textSize} px`;
  renderPreview();
});
document.fonts.ready.then(() => { if (state.config) renderPreview(); });
$('csvInput').addEventListener('input', event => { state.source = event.target.value; state.dirty = true; updateLineNumbers(); clearTimeout(state.timer); state.timer = setTimeout(parseSource, 300); }); $('csvInput').addEventListener('scroll', () => { $('lineNumbers').scrollTop = $('csvInput').scrollTop; });
$('formatCsv').addEventListener('click', () => { try { const rows = parseCsv(state.source); setSource(csvString(rows)); } catch (error) { showToast(error.message); } }); $('downloadCsv').addEventListener('click', () => download('technology-radar.csv', state.source, 'text/csv')); $('toggleLabels').addEventListener('click', () => { state.labels = !state.labels; renderPreview(); }); $('resetView').addEventListener('click', () => selectRadar('')); $('uploadButton').addEventListener('click', () => $('projectFile').click()); $('projectFile').addEventListener('change', async event => { const file = event.target.files[0]; if (file) setSource(await file.text()); event.target.value = ''; });
$('examples').addEventListener('change', async event => { const select = event.currentTarget, name = select.value; select.value = ''; if (!name || !EXAMPLE_FILES[name]) return; if (state.dirty && !confirm('Replace the current source?')) return; try { const response = await fetch(EXAMPLE_FILES[name]); if (!response.ok) throw new Error('Not found'); setSource(await response.text()); } catch { showToast(`Could not load the “${name}” example.`); } }); $('newButton').addEventListener('click', () => { if (!state.dirty || confirm('Replace the current source with a blank radar?')) setSource(REQUIRED.join(',') + '\n'); });
$('undoButton').addEventListener('click', () => { finishVisualEdit(); if (state.history.length) { state.future.push(state.source); setSource(state.history.pop(), false); if (state.editorMode === 'visual') renderVisualEditor(); } }); $('redoButton').addEventListener('click', () => { finishVisualEdit(); if (state.future.length) { state.history.push(state.source); setSource(state.future.pop(), false); if (state.editorMode === 'visual') renderVisualEditor(); } }); $('shareButton').addEventListener('click', () => $('shareDialog').showModal()); $('shareTopButton').addEventListener('click', () => $('shareDialog').showModal()); $('cancelShare').addEventListener('click', () => $('shareDialog').close()); $('closeShare').addEventListener('click', () => $('shareDialog').close()); $('shareDialog').addEventListener('change', updateShareOptions);
$('generateShare').addEventListener('click', async () => {
  const mode = document.querySelector('[name=shareMode]:checked').value, title = escapeHtml(`${$('previewTitle').textContent} radar`);
  try {
    let url, embed = '', meta;
    if (mode === 'image') {
      const format = document.querySelector('[name=shareImageFormat]:checked').value;
      url = await radarImageUrl(format); embed = `<img src="${url}" alt="${title}">`;
      meta = `${url.length} characters; self-contained ${format.toUpperCase()} image of the displayed radar. Use it as an image source; it is a snapshot and does not update.`;
    } else {
      url = await encodeShare(mode);
      if (mode === 'embed') embed = `<iframe src="${url}" title="${title}" width="100%" height="${$('shareIncludeTable').checked ? 1400 : 800}" style="border:0" loading="lazy"></iframe>`;
      meta = `${url.length} characters; ${state.validRows.length} technologies; encoded, not encrypted.`;
    }
    $('shareUrl').value = url; $('shareEmbed').value = embed; $('shareMeta').textContent = meta;
    $('shareEmbedField').classList.toggle('hidden', !embed); $('copyEmbed').classList.toggle('hidden', !embed);
    $('shareResult').classList.remove('hidden');
  } catch { showToast(mode === 'image' ? 'Could not create the radar image.' : 'Compressed sharing is unavailable in this browser.'); }
});
$('copyShare').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('shareUrl').value); showToast('Share link copied'); } catch { $('shareUrl').select(); showToast('Select the link and copy it'); } });
$('copyEmbed').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('shareEmbed').value); showToast('Embed code copied'); } catch { $('shareEmbed').select(); showToast('Select the embed code and copy it'); } });
document.querySelectorAll('[data-export]').forEach(button => button.addEventListener('click', () => { const svg = $('radarCanvas').querySelector('svg'); if (button.dataset.export === 'csv') download('technology-radar.csv', state.source, 'text/csv'); if (button.dataset.export === 'svg') download('technology-radar.svg', svg.outerHTML, 'image/svg+xml'); if (button.dataset.export === 'png') { const image = new Image(); image.onload = () => { const canvas = document.createElement('canvas'); canvas.width = 1640; canvas.height = 1140; canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); canvas.toBlob(blob => download('technology-radar.png', blob, 'image/png')); }; image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.outerHTML)}`; } if (button.dataset.export === 'print') window.print(); if (button.dataset.export === 'project') download('technology-radar.radar.json', JSON.stringify({ format: 'mightora-technology-radar', version: 1, createdAt: new Date().toISOString(), radarData: { csv: state.source }, configuration: { strategy: 'embedded' } }, null, 2), 'application/json'); }));
window.addEventListener('keydown', event => { if (!(event.ctrlKey || event.metaKey) || event.target.closest('.technology-cell-input')) return; if (event.key.toLowerCase() === 'z') { event.preventDefault(); (event.shiftKey ? $('redoButton') : $('undoButton')).click(); } if (event.key.toLowerCase() === 'y') { event.preventDefault(); $('redoButton').click(); } }); window.addEventListener('beforeunload', event => { if (state.dirty) { event.preventDefault(); event.returnValue = ''; } });
async function loadShared() { const match = location.hash.match(/^#\/(view|edit|embed)\/(.+)$/); if (!match) return false; try { const payload = await decodeShare(match[2]); if (payload.version !== 1 || typeof payload.csv !== 'string') throw new Error('Unsupported share payload.'); state.selectedRadar = payload.selectedRadarName || ''; setSource(payload.csv, false); state.dirty = false; if (match[1] === 'edit') openTab('data'); else { $('dataPanel').classList.remove('active-panel'); $('dataPanel').classList.add('hidden'); openTab('preview'); if (match[1] === 'embed') { document.body.classList.add('embed-mode'); document.body.classList.toggle('embed-no-table', payload.table === false); } else showToast('View-only radar loaded.'); } return true; } catch (error) { showToast(`Could not open shared radar: ${error.message}`); return false; } }
loadConfig().then(async () => { if (await loadShared()) return; state.source = localStorage.getItem('radar-builder-source') || EXAMPLE; $('csvInput').value = state.source; parseSource(); }); $('csvInput').addEventListener('input', () => localStorage.setItem('radar-builder-source', state.source));
