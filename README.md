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

Open `http://localhost:8080/`. `npm run test:e2e` rebuilds `dist`, starts the same Python static server, and runs the Chromium smoke test. The separate Python command is available for manual browser checks. Hash routes such as `#/view/<payload>` and `#/edit/<payload>` work beneath a repository subpath on GitHub Pages.

## Privacy

Uploaded and edited CSV is processed locally. Share links contain compressed radar data in the URL fragment; they are encoded, not encrypted, and can be read by anyone with the link. No account, backend, database, analytics, or server-side upload is required.

See [docs/sharing.md](docs/sharing.md) for the payload format.

## GitHub Pages deployment

Before the first deployment, a repository maintainer must select **Settings → Pages → Build and deployment → Source → GitHub Actions**. If `actions/configure-pages` reports `Get Pages site failed` / `Not Found`, verify this setting and the repository's Pages availability, then rerun the workflow.

The workflow validates and builds `dist` and uploads the Pages artifact in `build`. A separate `deploy` job depends on that build and configures and deploys the artifact through the `github-pages` environment. Only deployment receives Pages and OIDC write permissions. A successful build does not mean the site was deployed.

Automatic Pages enablement is intentionally disabled: `actions/configure-pages@v5` requires a separate privileged token for that operation, not the standard `GITHUB_TOKEN`. No additional credential is needed when Pages is configured in repository settings. Pushes to `main` and manual workflow dispatch trigger deployment; only do so with explicit user authorisation.
