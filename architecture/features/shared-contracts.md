# Shared feature contracts and alignment review

Status: Reviewed baseline contract; implementation behavior remains subject to each task's verification.
Reviewed: 2026-10-07

This document owns shared implementation rules for the planned features. Feature requirements live in the [feature index](README.md); [build-plan.md](build-plan.md) owns task and release status. `docs/sharing.md` is the detailed format reference, not a separate status tracker.

## Alignment review

| Finding | Resolution | Delivery coverage |
| --- | --- | --- |
| Visual editing and raw CSV editing could become competing sources of truth. | CSV remains canonical; visual edits serialize using the existing CSV format and source update path. | V01, V02 |
| Example selection and visual editing must use the same status vocabulary as the preview. | `public/config/radar-definition.yaml` owns valid status and dot-status IDs, labels, order, and display attributes; do not hard-code a divergent vocabulary. | X01, V01 |
| Sharing could expose user data or change compatibility. | Preserve share payload v1 and the existing privacy warning. Share data is compressed and encoded, not encrypted. Do not change the payload format. | F00, X01, R01 |

No application behavior was changed by this review. The listed contracts are the implementation baseline.

## Identity and storage

There are no accounts, authentication, roles, server-side sessions, or server authority. The application does not upload user CSV to a product backend.

## Data visibility, storage and sharing

| Surface | Permitted data |
| --- | --- |
| In-memory editor and `localStorage` | The user's source CSV; persistent source key is `radar-builder-source`. The Visual/CSV editor preference uses `radar-builder-editor-mode` (`visual` or `csv`). |
| Share URL fragment | Version 1 payload containing `version`, `csv`, `mode`, and optional `selectedRadarName`; compressed and Base64URL-encoded. Anyone receiving a link can decode its CSV. |
| Static host requests | Static application files, configuration, and selected example CSV; user CSV is not included in ordinary requests. |
| Downloads | User-requested CSV, SVG, PNG, print output, or portable project JSON. |

The required CSV columns, in exact order, are `Radar Name`, `Category`, `Sub Category`, `Technology`, `Status`, and `Dot Status`. Status and dot-status accepted labels and radar display vocabulary come from `public/config/radar-definition.yaml`; IDs and labels must remain aligned with that source. Share payload v1 is documented in [docs/sharing.md](../../docs/sharing.md). URL encoding is not encryption; the existing privacy warning must remain visible.

## Errors, diagnostics and privacy

Validation preserves the user's source and keeps the last valid preview. Preview-table edits commit on blur through canonical CSV/history only after validation; invalid drafts remain in their field until corrected or cancelled. Stale previews and shared View links have read-only tables. Do not add analytics, tracking, or server-side diagnostics. Error messages and any rendered values derived from CSV must be safely escaped or inserted through DOM properties.

Category and subcategory edge labels have no text background filter, and category bands have no fill; technology-name labels retain their backing. Keep this treatment in the preview and standalone SVG/PNG exports.
Radar text size is temporary view state (8-20 SVG px, default 11): it changes technology and curved section labels and their image/print exports, but not CSV, storage, history or share payloads. Placement checks dot and wrapped-label bounds, preserves status rings and category/subcategory membership, and retries with a larger fitted drawing radius when crowded. Extremely dense inputs beyond the bounded retries may still overlap; browser rendering remains a separate verification requirement.

## Behaviour that must not regress

CSV validation with a 300 ms debounce, last-valid preview, undo/redo, upload/download, the share dialog privacy warning, all exports, print view, the shared Mightora header, author and footer components, and the `footer.yaml` fetch patch in `<head>`.

## Out of scope

No backend, accounts, server storage, analytics or tracking, new runtime dependencies, framework migration, or share payload format change. The user-approved P02 rendering change places curved category labels on the outer edge and divides each equal category wedge into equal subcategory sections; status rings retain their configured meaning and order.
