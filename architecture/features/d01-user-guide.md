# D01 user guide implementation

Task and release status are owned by the [build plan](build-plan.md). This record describes the guide and its verification surface.

## Delivered surface

- [guide/index.html](../../guide/index.html) is a complete static document with all twelve requested sections, a table of contents, stable anchors, a skip link and return links to the app. It remains readable with JavaScript disabled. The table of contents is authored into HTML so navigation is available to crawlers and without scripts.
- [guide/guide.css](../../guide/guide.css) uses the existing style tokens and adds responsive prose, wrapping CSV examples, stacked definitions, visible keyboard focus and 44 px navigation targets. The shared mobile menu is retained; guide-only CSS lets its site title wrap and supplies its missing icon without a font dependency.
- The shared Mightora header, author and footer are retained. The head's footer-YAML patch is copied unchanged and js-yaml still precedes components.js. The guide's author uses the component's supported `config-url` with an empty inline JSON object, retaining the static biography without fetching a nonexistent config file. The app's existing author behavior is unchanged.
- Both app Documentation links point to `guide/`; GitHub has a separate navigation item. The toolbar uses a normal styled anchor with the existing new-tab behavior, preserving the open editor session and undo history. Header navigation uses the current tab. The only JavaScript change in the editor removes the obsolete GitHub-opening Documentation handler.
- [scripts/build.mjs](../../scripts/build.mjs) copies the guide directory into `dist/guide/`; relative asset and return links resolve from that directory. [README.md](../../README.md) links the guide and describes use and local serving. [docs/sharing.md](../../docs/sharing.md) remains the technical payload reference.

## Content and contracts

The guide names current controls and explains the exact CSV header, 300 ms validation, last-valid preview, row tools, undo/redo, examples, upload/download, all five export choices and mobile use. Status labels, IDs, ring order and descriptions follow `public/config/radar-definition.yaml`; automated content checks detect drift. No schema, storage key, payload or runtime dependency changes are introduced.

Sharing links to an in-page privacy warning with the dialog's exact text. The guide distinguishes whole-source downloads/shares from the selected preview, describes snapshot links and their lack of encryption/access control/revocation, and makes clear that `.radar.json` cannot currently be imported. Local storage is documented as browser-specific convenience rather than backup.

## Verification design

- `npm test` includes [scripts/guide-test.mjs](../../scripts/guide-test.mjs): checks YAML vocabulary and order, example names, CSV header, share warning, shared components, bootstrap order and unchanged fetch patch.
- [tests/e2e/guide.spec.js](../../tests/e2e/guide.spec.js) checks the built artifact, no-JavaScript readability, all local page/asset links and anchors, Documentation navigation, current control names, source persistence on return, keyboard skip/TOC/menu access, focus visibility, header bounds, touch targets, console errors and page overflow at 360/390/768/1024/1280 px. Tests use actual shared components, without mocking their network responses.
- The existing browser regression suite covers the editor, examples, sharing and responsive/print behavior after navigation changes. Executed commands, outcomes and limitations are in the [baseline](baseline.md) and build-plan delivery log.

Real-device, additional-browser, interactive screen-reader and deployed-host checks remain release work. A local guide test does not establish any production result.
