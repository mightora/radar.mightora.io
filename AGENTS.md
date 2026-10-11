# Repository Guidance

- Preserve the existing Technology Radar Live Editor and its behavior. Build output is generated from `index.html`, `src/`, and `public/` by `scripts/build.mjs`; update sources and build rather than editing `dist` by hand.
- Keep the site browser-only and static on GitHub Pages. No new runtime dependencies or share payload changes. Do not add a backend, accounts, server storage, analytics or tracking without an approved requirement.
- Process user CSV data in the browser and escape CSV-derived HTML. Never push or deploy without explicit user authorisation.
- Before UI changes, read [design-system.instructions.md](design-system.instructions.md). Before authoring or debugging browser tests, read [.github/skills/playwright-tests/SKILL.md](.github/skills/playwright-tests/SKILL.md).
- Search `src/app.js` for relevant code rather than reading the whole file. Keep changes to it minimal.

## Scope and reading

- This file owns the session protocol. [build-prompt.md](architecture/features/build-prompt.md) is a human-facing launch prompt, not required reading.
- For a named feature task, read its row and details, open decisions and handoff in [build-plan.md](architecture/features/build-plan.md), plus [shared-contracts.md](architecture/features/shared-contracts.md).
- Read other architecture documents only when relevant, including [README.md](architecture/features/README.md), [solution-pattern.md](architecture/solution-pattern.md), baseline and delivery archive. Do not open delivery skills' `method/` or `templates/` files.
- Apply the implementation workflow below to feature implementation. Advice and documentation-only requests need task-appropriate review, not feature-status updates or application regression tests.

## Implementation sessions

- One task per session; do only the named task, then stop. Implement, don't re-plan.
- Make routine decisions and record them; ask only if a pending-user decision blocks the task.
- The build plan alone owns task and release status, decisions, checks and limitations. Update it at start (In progress with scope) and completion (tracker row, a one- or two-line log entry, decisions and handoff). Move Verified task details to `delivery-archive.md`. The handoff's first step names the files and functions to change.
- Update [baseline.md](architecture/features/baseline.md) only when architecture, environment assumptions or baseline behavior changes.

## Verification

- Iterate with affected checks; keep Playwright specs in `tests/e2e/` scoped to the task. Assert relevant viewport (360/390/768/1024/1280) and keyboard behavior.
- Finish feature implementation once with `npm run check`, `npm test`, and `npm run test:e2e`, or use `scripts/run-all-tests.ps1` / `scripts/run-all-tests.sh`. The e2e command runs `npm run build` first; do not build separately for the same verification run. Runners save results under `test-results/local-*`.
- Use interactive browser or screenshot sessions only to diagnose failures. For manual checks, serve built output with `python -m http.server 8080 -d dist`.
- Record checks you could not run as pending; never claim they passed.
