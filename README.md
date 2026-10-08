# Technology Radar Live Editor

A static, local-first CSV technology radar editor for GitHub Pages. Edit the source, validate it after a short debounce, and inspect the deterministic SVG preview. CSV, SVG, PNG, print, and portable `.radar.json` downloads are generated in the browser.

## Usage

Choose **Load example** or **Upload CSV**, then open **Editor** and select **Visual** or **CSV**. Fix any **Errors**, inspect **Preview**, and use **Download CSV**, **Exports** or **Share** to save or share your radar. Share links are encoded, not encrypted.

Read the [user guide](guide/index.html) for a walkthrough, the required CSV columns, validation help, export formats and privacy details. The built guide is available at `/guide/`; both in-app **Documentation** links point there. [docs/sharing.md](docs/sharing.md) remains the technical share-format reference.

## Run locally

```sh
npm install
npx playwright install chromium
npm run check
npm test
npm run build
npm run test:e2e
python -m http.server 8080 -d dist
```

Open `http://localhost:8080/` or the guide at `http://localhost:8080/guide/`. The build copies `index.html`, `src/`, `public/` and `guide/` into `dist`; edit those sources rather than generated files. `npm run test:e2e` rebuilds `dist`, starts the same Python static server, and runs the Chromium browser tests. The separate Python command is available for manual browser checks. Hash routes such as `#/view/<payload>` and `#/edit/<payload>` work beneath a repository subpath on GitHub Pages.

To run the full local check suite and save its logs and Playwright report, run `scripts/run-all-tests.ps1` in PowerShell or `bash scripts/run-all-tests.sh` in Bash. Each run writes a summary, per-check logs, and the HTML report under a new `test-results/local-*` directory.

## Visual row tools

Choose **Visual** in the Editor to edit cells or add, duplicate, delete and move rows. Each row action is one undo step. Move up/down swaps with the adjacent row in CSV order, including hidden rows. Duplicates keep all cell values and show the existing duplicate-entry validation error until edited. Deleting the final row leaves the CSV headers intact.

**Filter rows** searches all six columns without case sensitivity; **Filter by radar** shares its selection with Preview. Filters only change which rows are visible: edits, downloads and share links retain hidden rows. **Clear filters** shows all rows again. Filters are temporary and do not add undo steps or storage keys.

**Add row** appends a row, inherits the selected radar (if any), clears the text filter, and focuses the first empty field. Status and Dot Status default to the first values in `public/config/radar-definition.yaml`. Fill the remaining required fields to update the preview; validation keeps the last valid preview while a row is incomplete. Row buttons have keyboard focus and accessible labels; after deletion, focus goes to a remaining visible row or Add row.

## Privacy

Uploaded and edited CSV is processed locally. Share links contain compressed radar data in the URL fragment; they are encoded, not encrypted, and can be read by anyone with the link. No account, backend, database, analytics, or server-side upload is required.

See [docs/sharing.md](docs/sharing.md) for the payload format.

## GitHub Pages deployment

Before the first deployment, a repository maintainer must select **Settings → Pages → Build and deployment → Source → GitHub Actions**. If `actions/configure-pages` reports `Get Pages site failed` / `Not Found`, verify this setting and the repository's Pages availability, then rerun the workflow.

The workflow validates and builds `dist` and uploads the Pages artifact in `build`. A separate `deploy` job depends on that build and configures and deploys the artifact through the `github-pages` environment. Only deployment receives Pages and OIDC write permissions. A successful build does not mean the site was deployed.

Automatic Pages enablement is intentionally disabled: `actions/configure-pages@v5` requires a separate privileged token for that operation, not the standard `GITHUB_TOKEN`. No additional credential is needed when Pages is configured in repository settings. Pushes to `main` and manual workflow dispatch trigger deployment; only do so with explicit user authorisation.
