# Static-browser solution pattern

This project is a browser-only application published as static files on GitHub Pages. The [high-level design](high-level-design.md) records project choices, [baseline](features/baseline.md) records observed checks, and the [build plan](features/build-plan.md) is the sole task and release tracker.

## Architecture and boundaries

- Build and publish HTML, CSS, JavaScript, and static assets. A local HTTP server supports browser fetches and modules; it is not a product backend.
- Process user data locally. Browser storage and URL data are user-visible; encoding and URL fragments are not encryption.
- Do not add authentication, an API, database, Docker, environment secrets, or platform wrappers without a demonstrated requirement. Never put private credentials in frontend code or static build variables.
- Document network requests, browser storage, imports, exports, share-link contents, privacy, and retention. Validate file inputs and make URL exposure clear.
- Keep source files authoritative. `scripts/build.mjs` creates `dist`; rebuild and verify rather than hand-editing generated output.

## Local development and verification

- Reuse package scripts and the existing Node toolchain. `npm run check`, `npm test`, and `npm run build` are the standard checks; `npm run test:e2e` runs Playwright against built output.
- Use `python -m http.server 8080 -d dist` for a local static server. Check built output, browser journeys, keyboard access, responsive behavior, browser APIs, assets, and fetch paths as applicable.
- Record exact commands, tool versions, outcomes, and unavailable browser/platform checks in the baseline and build plan.

## Static-host release

- `.github/workflows/pages.yml` builds and publishes `dist` on pushes to `main` or manual dispatch. A push to `main` deploys; do not publish or change workflows without authorization.
- Local build success does not prove live hosting. Release evidence requires the authorised workflow and a deployed user-journey check. Record unavailable live-host checks as pending.
- Database backups, migrations, and server readiness are inapplicable because this product owns no server-side data or runtime.
