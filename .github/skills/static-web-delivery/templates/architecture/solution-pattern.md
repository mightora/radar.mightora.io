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
- Select checks for affected surfaces using the guidance below and the core
  verification policy. This is a menu of risks, not a checklist for every edit.
- When shipped source or build inputs change, verify the affected behavior against
  fresh built output. Reuse it until those inputs change; count a build performed
  by the browser-test command instead of running another standalone build.
  Record commands, tool versions, outcomes and unavailable required checks in the
  core baseline/tracker.

### Verification selection

| Changed surface | Default checks |
| --- | --- |
| Internal docs, skills or prompts outside published output | Document/link/frontmatter checks only. |
| Published text or metadata | Relevant content/metadata assertions and built-file/link checks; browser review when rendering or layout could change. |
| Local JavaScript behavior | Applicable syntax checks and focused behavior tests; one affected browser journey when DOM/browser integration matters. |
| Component styling or interaction | Affected journey, keyboard/focus behavior and visual inspection at representative mobile and desktop widths. |
| Shared responsive layout or breakpoints | Affected views at changed breakpoint boundaries and required widths; broader layout regression as warranted. |
| Parsing, storage, imports/exports or sharing | Focused valid/invalid input, round-trip, compatibility and data-loss/privacy checks for affected contracts and consumers. |
| Build, startup, routes, asset/base paths or dependencies | Built-artifact and affected path/journey checks; broader regression for shared impact. |
| Release candidate | Required regression and browser/device matrix, plus separately authorized deployed-host smoke checks. |

- Honor all explicit task, repository and CI gates, including named widths and
  browsers. Defaults do not replace those requirements.
- Run functional cases at one representative viewport unless behavior differs by
  layout or an explicit gate requires more. Exercise responsive layout separately;
  do not repeat the entire functional suite at every width by default.
- Use existing browser tests as journey evidence. Add manual browser work only
  for an uncovered visual, interaction or accessibility risk. Capture screenshots
  for relevant visual states; inspect them, and do not treat capture alone as proof.
- Filter existing browser suites by file or test name during iteration. After a
  failure, rerun the affected check first; run required broad gates after the fix
  is stable. Do not regenerate unchanged artifacts or repeat a passing journey
  solely to produce another form of evidence.

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

In this repository, `npm run test:e2e` already runs `npm run build` before
Playwright. For focused row-tool work, for example, use
`npm run test:e2e -- tests/e2e/visual-row-tools.spec.js`; add a test-name filter
when a single behavior is affected. Run the full suite when required by the task
or shared impact. Do not run a separate build immediately before the e2e command.
