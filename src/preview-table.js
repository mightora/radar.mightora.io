// Keep cells stable during commits so clicking or tabbing to the next value keeps focus.
export function createPreviewTable(table, columns, onCommit) {
  const element = (tag, text) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; };
  const caption = element('caption'), head = element('thead'), header = element('tr'), body = element('tbody');
  columns.forEach(label => { const cell = element('th', label); cell.scope = 'col'; header.append(cell); });
  head.append(header); table.replaceChildren(caption, head, body);
  let active = null, settings;

  function closeEdit(focus = false) {
    if (!active) return;
    const { button, control, error } = active;
    active = null; control.remove(); error.remove(); button.hidden = false;
    if (focus) button.focus();
  }

  function commit(focus = false) {
    if (!active) return true;
    const edit = active;
    if (edit.control.value === edit.value) { closeEdit(focus); return true; }
    // Validate first; rejected drafts remain in the field and never replace valid CSV.
    const result = onCommit(edit.rowIndex, edit.columnIndex, edit.control.value, edit.value);
    if (typeof result === 'string') {
      edit.error.textContent = result;
      edit.control.setAttribute('aria-invalid', 'true');
      if (focus) edit.control.focus();
      return false;
    }
    closeEdit(focus);
    result();
    return true;
  }

  table.addEventListener('click', event => {
    const button = event.target.closest('.technology-cell-button');
    if (!button || button.disabled) return;
    if (!commit()) { active.control.focus(); return; }
    const rowIndex = Number(button.closest('tr').dataset.rowIndex), columnIndex = Number(button.dataset.columnIndex);
    const value = button.textContent;
    const control = element(columnIndex < 4 ? 'textarea' : 'select');
    control.className = 'technology-cell-input';
    control.setAttribute('aria-label', `${columns[columnIndex]}, preview row ${rowIndex + 1}`);
    if (columnIndex < 4) control.rows = Math.max(2, value.split('\n').length);
    else settings[columnIndex === 4 ? 'statuses' : 'dotStatuses'].forEach(choice => {
      const option = element('option', choice.label); option.value = choice.label; control.append(option);
    });
    control.value = value;
    const error = element('span'); error.className = 'technology-cell-error'; error.id = `preview-error-${rowIndex}-${columnIndex}`; error.setAttribute('role', 'status');
    control.setAttribute('aria-describedby', `technologyTableHelp ${error.id}`);
    active = { button, control, error, rowIndex, columnIndex, value };
    button.hidden = true; button.after(control, error);
    control.addEventListener('blur', () => commit());
    control.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); closeEdit(true); }
      if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); commit(true); }
    });
    control.focus();
    if (columnIndex < 4) control.select();
  });

  return function render(rows, options) {
    settings = options;
    const focused = document.activeElement, restoreFocus = table.contains(focused);
    caption.textContent = `Technologies — ${options.selectedRadar || 'All radars'}`;
    const existing = new Map([...body.rows].map(row => [Number(row.dataset.rowIndex), row]));
    const retained = new Set(rows.map(row => row.index));
    if (active && (!options.editable || !retained.has(active.rowIndex))) closeEdit();
    existing.forEach((row, index) => { if (!retained.has(index)) row.remove(); });
    rows.forEach(({ values, index }, position) => {
      let row = existing.get(index);
      if (!row) {
        row = element('tr'); row.dataset.rowIndex = index;
        columns.forEach((label, columnIndex) => {
          const cell = element(columnIndex === 3 ? 'th' : 'td');
          if (columnIndex === 3) cell.scope = 'row';
          const button = element('button'); button.type = 'button'; button.className = 'technology-cell-button'; button.dataset.columnIndex = columnIndex;
          button.setAttribute('aria-label', `Edit ${label}, preview row ${index + 1}`);
          cell.append(button); row.append(cell);
        });
      }
      [...row.cells].forEach((cell, columnIndex) => {
        const button = cell.querySelector('button'); button.textContent = values[columnIndex]; button.disabled = !options.editable;
      });
      if (body.rows[position] !== row) body.insertBefore(row, body.rows[position] || null);
    });
    if (restoreFocus && !focused.isConnected) table.closest('[tabindex]').focus();
  };
}
