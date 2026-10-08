# Repository Guidance

- Before changing browser UI, read and follow [design-system.instructions.md](design-system.instructions.md).
- Follow the delivery method in [architecture/features/README.md](architecture/features/README.md). [architecture/features/build-plan.md](architecture/features/build-plan.md) alone owns task and release status.
- Keep [architecture/features/baseline.md](architecture/features/baseline.md) and the build plan current with observed decisions, commands, outcomes, and limitations.
- Preserve the existing Technology Radar Live Editor and its behavior. Build output is generated from `index.html`, `src/`, and `public/` by `scripts/build.mjs`; update sources and build rather than editing `dist` by hand.
- Follow [architecture/solution-pattern.md](architecture/solution-pattern.md): this is a browser-only static site hosted by GitHub Pages. Do not add a backend, accounts, server storage, analytics, or tracking without an approved requirement.
- Use `npm run check`, `npm test`, `npm run build`, and `npm run test:e2e` for local verification; serve built output with `python -m http.server 8080 -d dist` for manual browser checks.
- No destructive stateful tests exist; user CSV data is processed in the browser. Never push or deploy without explicit user authorisation.

## Implementation sessions

- One task per session; do only the named task, then stop. Implement, don't re-plan.
- Treat [build-prompt.md](architecture/features/build-prompt.md) and this file as the session protocol; do not open the delivery skills' `method/` or `templates/` files.
- Read only the task's row and details, open decisions and handoff in the build plan, plus [shared-contracts.md](architecture/features/shared-contracts.md) (and the design system for UI work). Skip `delivery-archive.md` and `baseline.md` unless needed.
- Search `src/app.js` for what you need rather than reading the whole file. Keep changes to it minimal.
- Escape CSV-derived HTML. No new runtime dependencies, backend, tracking or share payload changes. Make routine decisions and record them; ask only if a pending-user decision blocks the task.
- Verify by risk: iterate with `npx playwright test tests/e2e/<spec>.spec.js --reporter=dot`; finish once with `npm run -s check; npm test; npm run -s test:e2e -- --reporter=dot` (it builds first). Encode viewport (360/390/768/1024/1280) and keyboard checks as Playwright assertions. Use interactive browser or screenshot sessions only to diagnose a failure. Record checks you couldn't run as pending; never claim them passed.
- Update the build plan twice: In progress with scope at start; at the end the tracker row, a one- or two-line log entry, decisions and handoff. Move Verified task details to `delivery-archive.md`. The handoff's first step names the files and functions to change.
