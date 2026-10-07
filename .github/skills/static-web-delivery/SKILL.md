---
name: static-web-delivery
description: >-
  Use for delivering browser-only apps and static websites: static build and
  hosting, browser-side data/privacy, imports/exports and URL sharing, generated
  artifacts, browser checks, routes and base paths, and static-host release evidence.
  Load alongside agentic-delivery for task tracking and session workflow. Not for
  products requiring a server-side API, server-enforced auth or persistent database.
---

# Static web delivery

Read [agentic-delivery](../agentic-delivery/SKILL.md) for the shared document
model, task tracker, evidence, session protocol and safety rules. Read this skill
only for static-browser architecture and verification; do not repeat core rules.

For testing, use the core's risk-based session protocol and the template's
[verification selection](templates/architecture/solution-pattern.md#verification-selection).
The profile lists possible checks, not a mandatory full browser matrix per edit.

Use [the static solution pattern](templates/architecture/solution-pattern.md)
as the target's `architecture/solution-pattern.md` when bootstrapping. Copy the
common templates from the core skill separately. A local HTTP server used for
development is not a product backend. If real server-side requirements emerge,
select [service-backed-delivery](../service-backed-delivery/SKILL.md) and track
the architecture change in the core build plan.