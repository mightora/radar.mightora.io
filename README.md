# Technology Radar Live Editor

A static, local-first CSV technology radar editor for GitHub Pages. Edit the source, validate it after a short debounce, and inspect the deterministic SVG preview. CSV, SVG, PNG, print, and portable `.radar.json` downloads are generated in the browser.

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

Open `http://localhost:8080/`. `npm run test:e2e` rebuilds `dist`, starts the same Python static server, and runs the Chromium browser tests. The separate Python command is available for manual browser checks. Hash routes such as `#/view/<payload>` and `#/edit/<payload>` work beneath a repository subpath on GitHub Pages.

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
