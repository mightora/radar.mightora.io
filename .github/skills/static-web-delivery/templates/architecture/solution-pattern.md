# Static-browser solution pattern

Use this template as `architecture/solution-pattern.md` for browser applications
delivered as static files without a server-side runtime or private server-side
data. The [high-level design](high-level-design.md) records project choices;
the [baseline](features/baseline.md) records observed checks. The shared method
and task tracker follow the agentic-delivery core skill.

## Architecture and boundaries

- Build and publish HTML, CSS, JavaScript and static assets to the chosen host.
  A local HTTP server may be needed for fetch, modules or routes; it is not a
  product backend.
- Process user data locally unless remote processing is explicitly required.
  Treat browser storage and URL data as user-visible and potentially shareable;
  encoding and URL fragments are not encryption.
- Do not add authentication, an API, database, Docker, Compose, environment
  secrets or per-platform launch wrappers without a demonstrated requirement.
  Never put private credentials in frontend code or static build variables.
- Document network requests, browser permissions, storage, imports, exports and
  share-link contents, including privacy and retention behavior. Validate file
  inputs and make exported data and URL exposure clear to users.
- Keep source files authoritative. If generated output is committed, rebuild it
  from source and check that it matches; never hand-edit generated artifacts.

## Local development and verification

- Reuse real package scripts and the existing toolchain. Document one local start
  command and an automated verification command or sequence. Add platform
  wrappers only for a demonstrated portability need.
- Check applicable syntax/build, data/config, import/export, browser journeys,
  responsive/accessibility behavior, browser API support, base paths, assets,
  fetch paths and refresh/deep-link or hash-route behavior.
- Verify built output as well as source. Record commands, tool versions, outcomes
  and browser/platform checks that could not be run in the core baseline/tracker.

## Static-host release

- Follow the existing host and deployment workflow. For repository-subpath
  hosting, check the base URL, asset/fetch paths, routing and published artifact.
- Keep CI/build validation separate from deployment. Do not publish or change
  workflows without authorization. A local build does not prove the live site.
- Release evidence includes source revision, successful build, published artifact
  or workflow, and a deployed smoke check of a real user journey. Record any
  unavailable host checks as pending, not passed.
- Database backups, migrations and server readiness checks are inapplicable
  unless the product actually owns those resources.

## Example: Technology Radar

This repository has a client-side CSV editor and SVG preview from static files.
Its existing checks are `npm run check`, `npm test` and `npm run build`; Python's
static HTTP server serves the output locally. The build copies `index.html`,
`src/` and `public/` into `dist/`. Relevant checks include CSV/config examples,
browser compression, hash routes under a repository subpath and local-only file
processing. Share-link payloads are encoded, not encrypted. These are examples,
not requirements for every static site.