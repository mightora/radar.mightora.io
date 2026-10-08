# Implementation prompt

Paste the main prompt into a new agent session in this repository, replacing `<ID>` with one task from the table below (or the handoff's next task). One task per session keeps context and cost low; start a fresh session for the next task. The session rules live in [AGENTS.md](../../AGENTS.md), which is attached automatically, so the prompt stays short.

## Main prompt

```text
Implement <ID> from architecture/features/build-plan.md, then stop.
Follow the "Implementation sessions" rules in AGENTS.md.
Report: task ID, user-visible changes, checks and outcomes, pending items, next task.
```

## Tasks

| Task | Scope |
| --- | --- |
| Z01 | Bounded, accessible zoom in/out/reset on the radar preview; reset-to-fit; exports unscaled. |
| P01 | Improve radar label contrast and add a responsive formatted technology table beneath the selected radar. |
| W01 | Add browser-generated Word-compatible export for the selected radar and technology table. |
| S01 | SEO metadata, JSON-LD, robots.txt, sitemap.xml and llms.txt; keep the h1 static. No analytics. |
| R01 | Full regression and release evidence. Runs the whole suite and the browser journey. Do not push. |

Verified tasks (F00, X01, V01, V02, M01, D01) are recorded in the [delivery archive](delivery-archive.md).

## Cost tips

- Use a lighter model for docs or metadata tasks such as S01, and a stronger one for tasks with complex UI logic.
- If a session runs long, stop it, ask for a handoff update, and continue in a fresh session.
