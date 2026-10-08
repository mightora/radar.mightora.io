# Delivery archive

Historical detail moved out of the [build plan](build-plan.md) to keep the active tracker small. This file is a record only: it holds no current task or release status, and implementation sessions do not need to read it. When a task is Verified, move its task details and delivery-log entries here.

## Archived task details and exit checks

### P01 — preview label readability and technology table

- Give words plotted on the radar a slightly transparent gray background so they remain legible over ring colors.
- Show a neatly formatted table beneath the radar containing the technologies in the selected radar, using the existing radar vocabulary and six-column CSV data as appropriate.
- Keep the preview and table usable at 360, 390, 768, 1024 and 1280 px; safely render all CSV-derived values and preserve the current radar, editor, share and export behavior.
- Exit: table contents match the selected radar and valid source data, labels remain readable without obscuring the radar, keyboard/screen-reader users can understand the table, and focused browser checks show no page overflow or regressions.
- Implementation record (2026-10-08): `renderPreview()` includes a translucent gray SVG filter for category/technology labels and passes the plot's rows to `renderTechnologyTable()`. The table preserves source order, uses safe DOM text, a caption and scoped headers, and retains the last valid data with an error notice. Its scroll region is keyboard accessible and long cells wrap. Label toggling and standalone SVG/PNG downloads retain their existing data and dimensions; sources were rebuilt into `dist`.
- Exit evidence: `npm run check`, `npm test`, `npm run build`, and `npm run test:e2e -- --reporter=list,html` passed (34/34 Chromium); `npx playwright test tests/e2e/preview-table.spec.js --reporter=dot` passed 9/9. Assertions cover selection, visual editing/history, invalid/empty CSV, literal hostile text, table semantics, keyboard scrolling, no page overflow at all five widths, label toggling and SVG/PNG downloads. Interactive screen-reader/device/other-engine checks and integration with the unimplemented Z01 zoom remain pending; see the build plan for current status.

### T01 — Playwright task-scoped authoring and local result runners

- Added `.github/skills/playwright-tests/SKILL.md` to limit new browser specs to the active task and keep them in `tests/e2e/`; static-web delivery and repository guidance now route Playwright work through that skill.
- Added `scripts/run-all-tests.ps1` and `scripts/run-all-tests.sh` to run `npm run check`, `npm test`, `npm run build`, and `npm run test:e2e`, continuing through failures and returning a failing exit code if any check fails.
- Each run writes a summary, per-check logs, Playwright artifacts, and an HTML report under an ignored `test-results/local-*` directory. Bash translates the artifact path when WSL invokes Windows Node and collects the HTML report into that run folder.
- Exit evidence: both runners passed all four checks and 25/25 Chromium tests. Bash run: `test-results/local-20261008-083257-yHiE48/`; PowerShell run: `test-results/local-20261008-093116-144334/`. `bash -n scripts/run-all-tests.sh` passed. The Pages workflow was not changed.

### F00 — baseline, method bootstrap and decisions

- Bootstrap the method from `.github/skills/agentic-delivery/templates/` and `.github/skills/static-web-delivery/templates/architecture/solution-pattern.md`: create `AGENTS.md`, `BACKLOG.md` (the five requests above, verbatim), `architecture/solution-pattern.md`, `architecture/high-level-design.md`, `architecture/features/README.md`, `architecture/features/shared-contracts.md` and `architecture/features/baseline.md`. Keep shared contracts short: CSV schema (six required columns), `radar-definition.yaml` as the status/dot vocabulary, `localStorage` key `radar-builder-source`, share payload v1 per [docs/sharing.md](../../docs/sharing.md). Link the existing [design-system.instructions.md](../../design-system.instructions.md) from `AGENTS.md`; do not overwrite it.
- Run and record: `npm install`, `npm run check`, `npm test`, `npm run build`, then serve `dist` (`python -m http.server 8080 -d dist`) and walk the main journey in a browser.
- Record these pre-inspection findings and confirm them against the running app:
  - Examples use `window.prompt()` with a free-text name ([src/app.js](../../src/app.js), `examplesButton` handler, `EXAMPLE_FILES` map).
  - `loadShared()` is defined but never called, so `#/view/` and `#/edit/` links may not load their payload. Record as a pre-existing defect; see D-05.
  - Header nav links to `#examples`, which has no matching element.
  - Documentation button opens the GitHub repository; there is no user guide.
  - `<head>` has only `title`, `viewport`, `theme-color`; no description, canonical, Open Graph, structured data, `robots.txt` or `sitemap.xml`. The `<h1>` is overwritten at runtime with the radar name.
  - [scripts/smoke-test.mjs](../../scripts/smoke-test.mjs) asserts source text only; there are no behavioural or browser tests.
  - [scripts/build.mjs](../../scripts/build.mjs) copies only `index.html`, `src/`, `public/`; any new root files (guide, robots, sitemap) need adding.
- Install Playwright per D-04, add a minimal e2e test that loads the built app and asserts the radar SVG renders, and record its command and outcome.
- D-01, D-04, and D-05 are decided.
- Exit: baseline.md lists actual commands with observed outcomes, the findings above confirmed or corrected, browser checks performed (browser + viewport) and checks not performed marked pending.

### X01 — example picker drop-down

- Replace the `prompt()` flow with an accessible `<select>` (labelled "Load example") populated from `EXAMPLE_FILES`, with a placeholder option. Selecting loads the file; keep the existing "Replace the current source?" confirmation when `state.dirty`. Cancelling confirmation resets the select to the placeholder.
- Either repurpose the `Examples` toolbar button into the select or place the select in the toolbar; give it `id="examples"` (or equivalent anchor) so the header nav link resolves.
- Loading an example goes through `setSource()` so undo/redo and `localStorage` behave as for other edits (note: `setSource` currently does not persist to `localStorage`; persist consistently).
- Add behavioural tests for: list matches files in `public/examples/`, every example parses with zero validation errors.
- Exit: no `prompt(` call remains for examples; every example loads from the select in a browser; cancel leaves source unchanged; failed fetch shows the toast and leaves source unchanged; keyboard-only selection works; undo restores the prior source; `npm run check`, `npm test`, `npm run build` pass.

### V01 — visual table editor with two-way CSV sync

- Add an editor mode switch inside the Editor panel: `Visual` | `CSV`. CSV text remains the single source of truth (D-02); the visual editor reads parsed rows and writes back via `csvString()` + `setSource()`.
- Render a table with one row per technology: text inputs for Radar Name, Category, Sub Category, Technology; `<select>` for Status and Dot Status populated from the loaded YAML config. Offer `<datalist>` suggestions for Radar Name/Category/Sub Category from existing values.
- Per-cell validation: highlight cells referenced by `validate()` errors and expose the message via `aria-describedby`.
- When the CSV cannot be parsed (e.g. unclosed quote, wrong headers), the visual editor shows a read-only notice with a "Switch to CSV to fix" action and never overwrites the source.
- Remember the chosen mode in `localStorage`.
- No new runtime dependency.
- Exit: edits in Visual update CSV text, preview and error count after debounce; edits in CSV update Visual on switch; round-trip of every example through Visual → CSV produces identical parsed rows; values containing commas, quotes and newlines survive round-trip; invalid CSV is never rewritten by the visual editor; undo/redo covers visual edits; all user values rendered via `escapeHtml` or DOM properties (no HTML injection from CSV cells); keyboard Tab order moves across cells.

### V02 — visual editor row tools

- Add row, delete row, duplicate row, move up/down; a text filter to narrow visible rows; a radar-name filter aligned with the preview's radar selector.
- New rows default Status/Dot Status to the first configured values.
- Exit: each operation is a single undo step; deleting the last row leaves a valid header-only CSV; filter never drops hidden rows from the written CSV; duplicate rows surface the existing "Duplicate technology entry" error; screen reader labels on icon buttons.

### M01 — small-screen responsive layout

- Audit at 360, 390, 768 and 1024 px widths. Target: no horizontal page scroll; toolbar wraps or collapses into an overflow menu with primary actions (Examples, Share) visible; tabs scroll horizontally or stack without clipping; touch targets at least 44×44 px.
- Visual editor: switch to a stacked card-per-row layout below a breakpoint (labels visible per field).
- CSV editor: line numbers stay aligned; font size at least 16 px on inputs to avoid iOS zoom.
- Radar preview: SVG scales to width; legend moves below the radar; category labels do not clip (adjust `viewBox` padding if needed); toggling labels remains available.
- Share dialog fits within the viewport with scrollable content.
- Respect `<mightora-header>` built-in mobile menu; do not duplicate it. Follow [design-system.instructions.md](../../design-system.instructions.md) focus styles.
- Exit: screenshots or recorded browser checks at each width for Editor (both modes), Preview, Errors, Exports and Share dialog; no horizontal overflow (`document.documentElement.scrollWidth <= innerWidth`); desktop layout unchanged at 1280 px; print view unaffected. Real-device checks (iOS Safari, Android Chrome) are release checks if not available locally.

### D01 — user guide and in-app documentation

- Create a static, crawlable guide page (D-03, proposed `guide/index.html`) using the same header, author and footer components. Sections: What is a technology radar; Quick start; Loading an example; Visual editor; CSV editor and required columns; Statuses and dot statuses (generated from or kept in sync with `radar-definition.yaml`); Validation errors; Sharing (link to privacy warning, encoded not encrypted); Exports; Using on mobile; Privacy and data; FAQ.
- Point the toolbar `Documentation` button and header nav `Documentation` link at the guide. Keep the GitHub link as a separate nav item.
- Update [README.md](../../README.md) with a short usage section linking the guide; keep [docs/sharing.md](../../docs/sharing.md) as the technical format reference.
- Update `scripts/build.mjs` to copy the guide into `dist`.
- Exit: every documented control exists with the documented name; guide renders with no console errors and passes the M01 widths; internal links and anchors resolve in `dist`; test asserts the built guide exists and the docs button targets it.

## Archived delivery log

- **2026-10-08** — D01 started at `ab706357f8816fac0d8454d522c492755aa292d4` on `main`; working tree clean. User explicitly selected D01 only, before Z01. Loaded agentic/static delivery skills and repository contracts. Scope: crawlable guide using shared components, navigation, README, build copy, vocabulary/link/keyboard/viewport checks. Z01, S01 and release actions remain outside this session. Main risk is broken built navigation or inaccurate instructions; verify links and vocabulary first, then required syntax/smoke/build and Chromium browser gates at all five widths.
- **2026-10-08** — D01 verified locally. Added the twelve-section static guide and static TOC, vocabulary guards, both Documentation destinations, separate GitHub navigation, README usage and build copy. Preserved the head footer patch and shared components. Used the shared author's supported empty inline config on the guide to retain its biography without a missing-file request; guide-only CSS fixes the shared mobile title overlap and missing menu glyph. Initial browser launch was blocked by sandbox `spawn EPERM`; approved rerun exposed the guide author 404 and incorrect closed-menu test assumptions (2/7 passed), then the focused suite passed 7/7 after fixes. Screenshot review prompted the mobile header polish. Final `npm run check`, `npm test`, and the build invoked by `npm run test:e2e` passed; full Chromium suite passed 22/22, including existing M01 checks. Screenshots inspected at all five widths; page width matched viewport width and guide console checks were clean. `git diff --check` passed. No commit, push, deployment or backlog release-state change; real-device, other-browser, screen-reader and live-host checks remain pending.
- **2026-10-07** - Delivery-skill maintenance: added risk-based check selection, explicit stop conditions, focused browser/viewport guidance and duplicate-build avoidance to the skills and reusable planning/implementation templates. `python .github/skills/agentic-delivery/scripts/validate.py` passed (34 documents, 78 local links). No application changes or application test runs; existing release gates and the known M01 test limitation remain unchanged. See [baseline](baseline.md).
- **2026-10-07** — User confirmed D-01 (`https://radar.mightora.io/`) and D-04 (Playwright approved). D-05 still pending.
- **2026-10-07** — Plan created from repository inspection. No code changed; no checks run.
- **2026-10-07** — F00 verified. Bootstrapped `AGENTS.md`, `BACKLOG.md`, `architecture/solution-pattern.md`, `architecture/high-level-design.md`, `architecture/features/README.md`, `shared-contracts.md`, and `baseline.md`; documented local commands in `README.md`; added Playwright Chromium smoke test. `npm install` -> 0 vulnerabilities; `npm run check` -> passed; `npm test` -> passed; `npm run build` -> passed; `npm run test:e2e` -> 1/1 passed. Local browser confirmed the listed behavior gaps and reproduced D-05. Pending viewport, real-device, and deployed-host checks are in `baseline.md`.
- **2026-10-07** — CI repair locally verified: run `37627582404` failed in Pages configuration after a successful build. Separated `.github/workflows/pages.yml` build/artifact upload from dependent deployment with deployment-only write permissions and the `github-pages` environment; added workflow smoke assertions and README setup instructions. Regression test failed before the fix and passed afterward; `npm run check`, `npm test`, `npm run build`, `npm run test:e2e` (1/1), and `git diff --check` passed. Release remains blocked pending maintainer Pages setup and a successful live deployment; no feature release state changed. See [baseline](baseline.md).
- **2026-10-07** — X01 started. D-05 remains pending; this session implements the example picker only.
- **2026-10-07** — X01 verified locally. Added the accessible toolbar example select and ensured `setSource()` persists programmatic source changes. All seven example files matched the picker map and loaded with zero validation errors; keyboard selection, cancel, failed fetch, undo, and storage behavior passed. `npm run check`, `npm test`, `npm run build`, and `npm run test:e2e` (3/3) passed. Local browser width checks found overflow at 360, 390, and 768 px; responsive follow-up remains in M01. No deployment or commit performed; D-05 remains pending user approval.
- **2026-10-07** — User approved D-05. X01 reopened to wire the existing v1 `loadShared()` path into startup and verify view/edit shared URLs; no payload format change.
- **2026-10-07** — D-05 implemented and X01 re-verified. Startup now loads a valid v1 view/edit link before falling back to localStorage. `npm run check`, `npm test`, `npm run build`, and `npm run test:e2e` passed (4/4); test proves incoming shared CSV wins over a different stored source. Integrated browser confirmed a generated view URL loads its CSV and preview. Payload format and privacy warning unchanged.
- **2026-10-07** — V01 started. D-02 resolved in line with the shared contract: CSV remains canonical; use DOM-created controls, preserve multiline cell values, and store the selected editor mode under `radar-builder-editor-mode`.
- **2026-10-07** — V01 verified. Added the Visual/CSV switch, DOM-rendered table with configured status choices and suggestions, per-cell accessible validation, malformed-source read-only state, mode persistence, and visual-edit undo/redo. `npm run check`, `npm test`, `npm run build`, and `npm run test:e2e` passed; browser suite passed 8/8. Every example round-tripped to identical parsed rows; quoted, comma-containing and multiline values survived; invalid CSV stayed unchanged. Keyboard Tab traversal passed at 360, 390, 768, 1024, and 1280 px. The editor's table stayed within its own horizontal scroller; overall page overflow remains at 360 (468 px), 390 (468 px), and 768 (810 px), tracked for M01. No commit, push, or deployment performed.
- **2026-10-07** — V02 started at `426cd4a00647056cdddd9c3b72d202d6128bbe8c`. Inspected the dirty worktree and preserved existing X01/V01 edits in source, tests, contracts, baseline, tracker and generated output. Scope is V02 only: add/delete/duplicate/move, text/radar filters, and their verification. M01 responsive redesign and all deployment actions remain outside this session.
- **2026-10-07** — V02 implementation and browser tests added. `npm run check` and `npm test` passed. The first `npm run test:e2e` attempt stopped in the build with sandbox `EPERM` removing generated `dist`; retried with approved escalation. Browser verification remains in progress.
- **2026-10-07** — V02 verification follow-up: initial browser run passed 10/14; four new tests used an exact label-text locator that included option text. Changed those tests to the select's accessible role/name. Next run passed all six V02 tests and 13/14 overall; the existing share-link test timed out in `page.goto()` waiting for full page load after the app rendered. Its receiving pages now wait for `domcontentloaded` and retain the existing source/preview assertions. Full regression rerun pending.
- **2026-10-07** — V02 verified locally. Added add/delete/duplicate/move and combined text/radar filters, preserving hidden source rows, configured defaults, single-step row history and last-valid validation behavior. `npm run check` -> passed; `npm test` -> passed; `npm run build` (invoked by the browser command) -> passed; final `npm run test:e2e` -> 14/14 passed, including six V02 tests; `git diff --check` -> passed. Playwright Chromium exercised the generated artifact using the configured local Python server and saved screenshots at 360/390/768/1024/1280 px. Filter controls fit their containers; overall page widths remain 468/468/810/1024/1280 px, so the prior narrow-screen overflow remains for M01. README and [V02 implementation record](v02-visual-row-tools.md) document the behavior. No commit, push, deployment or backlog release-state change.
- **2026-10-07** — Added workspace `agent-optimization` and `search-engine-optimization` skills for future S01 work. Validated skill headers, names and repository references; VS Code reported no diagnostics. No site files, feature status, or release state changed; S01 still depends on D01.
- **2026-10-07** — M01 verified locally. Preview is now the default landing panel; edit-share links still open Editor. Restyled the workspace tabs to use a quiet underline treatment consistent with the page. Updated browser journeys to explicitly open Editor when editing. `npm run check`, `npm test`, `npm run build` passed; `npm run test:e2e` passed 15/15, including five responsive widths with no horizontal page overflow, share-dialog fit, and print behavior. Real iOS/Android and deployed-host checks remain pending; no deployment performed.
