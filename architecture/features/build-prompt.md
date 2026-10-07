# Implementation prompt

Paste the main prompt into a new agent session in this repository. It resumes the [build plan](build-plan.md) from its task table and handoff, so it does not need rewriting between sessions. Append one scope line from the list below to constrain a session.

## Main prompt

```text
Implement the features in architecture/features/build-plan.md.

Load the skills .github/skills/agentic-delivery/SKILL.md and
.github/skills/static-web-delivery/SKILL.md. First read AGENTS.md (if present),
design-system.instructions.md, architecture/features/README.md and
shared-contracts.md (if present), and the build plan's task table, decisions and
current handoff. Inspect git status before editing. Preserve unrelated user work.
This extends the existing Technology Radar Live Editor; do not rewrite it in a
framework or restructure src/app.js beyond what the task needs.

Treat this as an implementation request, not another planning exercise. Resume
any In progress task if still valid; otherwise start the next Not started task
whose dependencies and gating decisions are resolved. Work through ready tasks
in plan order, completing coherent slices.

Use the shared contracts for the CSV schema, radar-definition.yaml vocabulary,
localStorage keys and share payload v1. Preserve existing behaviour: CSV
validation with 300ms debounce, last-valid preview, undo/redo, upload/download,
share dialog privacy warning, all exports, print view, shared Mightora header,
author and footer components, and the footer.yaml fetch patch in <head>.

Do not broaden into: a backend, accounts, server storage, analytics or tracking,
new runtime dependencies, framework migration, radar rendering redesign, or
changes to the share payload format.

This is a static GitHub Pages app. Verify with npm run check, npm test,
npm run build, and a browser session against dist served locally
(python -m http.server 8080 -d dist). For UI work, check keyboard access and the
widths 360, 390, 768, 1024 and 1280 px. Escape all CSV-derived values rendered
as HTML. Record browser, device and deployed-URL checks that you could not run
as pending release checks; never claim them passed.

Before coding a task, mark it In progress in the build plan. Implement the
behaviour, tests and documentation together. Make routine decisions and record
them; ask only when a decision in the plan is marked pending user and blocks the
task. Pushing to main deploys to production: do not commit-push or deploy
without explicit user authorisation.

Update architecture/features/build-plan.md as you go: task state, evidence
(commands and outcomes), decisions, delivery log and current handoff. Mark a
task Verified only when its exit checks pass. Keep Verified separate from
Released. Update BACKLOG.md only when a feature meets its release gate.

At session end, report completed task IDs, user-visible changes, checks and
outcomes, blockers or pending release checks, and the exact next task.
```

## Per-task scope lines

Append exactly one to the main prompt.

| Task | Scope line |
| --- | --- |
| F00 | `For this session, complete F00 only: bootstrap the method documents, run and record the baseline, set up Playwright, confirm the findings, and ask me to confirm D-05 if still pending.` |
| X01 | `For this session, complete X01 only: replace the typed example prompt with an accessible drop-down, plus the D-05 share-link fix if approved.` |
| V01 | `For this session, complete V01 only: add the Visual/CSV mode switch and a dependency-free table editor with two-way sync. Do not add row tools yet.` |
| V02 | `For this session, complete V02 only: add row add/delete/duplicate/move and filtering to the visual editor.` |
| M01 | `For this session, complete M01 only: make every panel, the toolbar, the visual editor and the share dialog work on small screens without changing the desktop layout.` |
| D01 | `For this session, complete D01 only: write the user guide as a static crawlable page, wire the Documentation links to it, and update README and the build script.` |
| S01 | `For this session, complete S01 only: add SEO metadata, JSON-LD, robots.txt, sitemap.xml and llms.txt, and keep the h1 static. No analytics.` |
| R01 | `For this session, complete R01 only: run the full regression and prepare release evidence. Do not push.` |

To resume the full plan, use the main prompt unchanged.
