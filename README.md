# Technology Radar Live Editor

A static, local-first CSV technology radar editor for GitHub Pages. Edit the source, validate it after a short debounce, and inspect the deterministic SVG preview. CSV, SVG, PNG, print, and portable `.radar.json` downloads are generated in the browser.

## Run locally

```sh
npm install
npm run check
npm test
npm run build
python3 -m http.server 8080 -d dist
```

Open `http://localhost:8080/`. Hash routes such as `#/view/<payload>` and `#/edit/<payload>` work beneath a repository subpath on GitHub Pages.

## Privacy

Uploaded and edited CSV is processed locally. Share links contain compressed radar data in the URL fragment; they are encoded, not encrypted, and can be read by anyone with the link. No account, backend, database, analytics, or server-side upload is required.

See [docs/sharing.md](docs/sharing.md) for the payload format.