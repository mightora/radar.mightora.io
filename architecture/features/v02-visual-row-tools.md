# V02 implementation record

Task and release status, executed checks, and handoff are owned by [build-plan.md](build-plan.md). Browser measurements and remaining release checks are recorded in [baseline.md](baseline.md).

## Behavior and decisions

- The existing Visual editor gains Add row, Delete, Duplicate, Move up/down, a text search and a radar selector. The CSV schema, storage keys, 300 ms validation timer and share payload v1 are unchanged.
- Row actions parse and serialize the complete canonical source through `csvString()` and `setSource()`. Cell edits update a source row by its original index. Filtering only hides table rows, so hidden data survives editing, row actions, downloads and sharing.
- Moves swap adjacent rows in CSV order, including hidden rows. Boundary buttons are disabled. Duplicate inserts an exact copy immediately after the original; the existing duplicate-entry validator handles it. Deleting the final row serializes the required header without inventing a blank data row.
- Add appends a row with the first configured Status and Dot Status labels. It inherits a selected radar, clears text search and focuses the first empty field. Required blank cells remain subject to ordinary validation and the last-valid preview behavior.
- Search is case-insensitive across all six columns and combines with the radar filter. Radar options use current parsed source and last-valid rows so invalid edits do not lose the preview's choices; a removed selection resets to All radars when no longer present. The visual filter, Preview selector and Reset view use the same radar selection. Neither filter adds an undo step or a storage key.
- Each row action adds one source-history entry. A pending cell edit is committed separately before an action or keyboard undo; Undo/Redo immediately refreshes the visual table while validation remains debounced. An edited row stays visible while its cell has focus, even if the new text stops matching the filter.
- CSV values are inserted using DOM properties. Row icons have accessible action/row labels, tooltips, visible keyboard focus and 44 px targets. Focus follows moved/duplicated rows; deletion chooses a remaining visible row or Add row. Tools are hidden when the source cannot be parsed.

## Implementation and verification coverage

- `src/app.js`: localized extensions to V01 rendering, delegated events, source history and the preview radar selector. Existing rendering, sharing and export implementations remain in place.
- `index.html` and `src/styles.css`: filter controls, live row count and row-action column within the existing table scroller. The shared Mightora components and footer fetch patch are preserved. Mobile cards and broader page layout remain M01 work.
- `tests/e2e/visual-row-tools.spec.js`: browser behavior tests against generated `dist`, covering single-step history, final-row deletion, combined filters, hidden-row preservation, CSV download and v1 sharing, custom YAML defaults, keyboard undo before blur, special CSV values, HTML injection protection, malformed-source safety and keyboard journeys at 360/390/768/1024/1280 px.
- `README.md`: user instructions for row operations, filter behavior and defaults. `dist` is generated only by the existing build script.

No framework, runtime dependency, backend, account, analytics, storage contract or share format was added. Release tracking and the backlog must wait for the existing release gate.
