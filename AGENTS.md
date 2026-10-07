# Repository Guidance

- Before changing browser UI, read and follow [design-system.instructions.md](design-system.instructions.md).
- Follow the delivery method in [architecture/features/README.md](architecture/features/README.md). [architecture/features/build-plan.md](architecture/features/build-plan.md) alone owns task and release status.
- Keep [architecture/features/baseline.md](architecture/features/baseline.md) and the build plan current with observed decisions, commands, outcomes, and limitations.
- Preserve the existing Technology Radar Live Editor and its behavior. Build output is generated from `index.html`, `src/`, and `public/` by `scripts/build.mjs`; update sources and build rather than editing `dist` by hand.
- Follow [architecture/solution-pattern.md](architecture/solution-pattern.md): this is a browser-only static site hosted by GitHub Pages. Do not add a backend, accounts, server storage, analytics, or tracking without an approved requirement.
- Use `npm run check`, `npm test`, `npm run build`, and `npm run test:e2e` for local verification; serve built output with `python -m http.server 8080 -d dist` for manual browser checks.
- No destructive stateful tests exist; user CSV data is processed in the browser. Never push or deploy without explicit user authorisation.
