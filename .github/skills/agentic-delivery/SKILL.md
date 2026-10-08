---
name: agentic-delivery
description: >-
   Use for the common spec-driven delivery lifecycle: bootstrap project documents,
   plan features and tasks in one tracker, run implementation sessions, record
   verification evidence and handoffs, and distinguish verified from released.
   Select a separate architecture profile for static-browser or service-backed
   projects. Not for one-off debugging or projects with a working delivery process.
---

# Agentic delivery method

A repeatable way to deliver software with coding agents across many sessions,
where no single session holds the whole context. The repository itself carries
the plan, the contracts, the evidence and the handoff.

## Core idea

Agents are good at implementing a bounded slice against a clear contract. They are
bad at remembering what happened last week, and they tend to re-plan instead of
build. So:

1. **Write the design down before building.** Feature specs describe customer
   requirements. Shared contracts describe cross-feature rules.
2. **Keep exactly one tracker.** The build plan owns task state, dependencies,
   evidence, decisions and the current handoff. Nothing else claims status.
3. **Use one stable prompt.** The prompt points at the tracker, so it does not
   need rewriting between sessions.
4. **Separate implemented from verified from released.** Evidence is commands and
   outcomes, never assertion.
5. **Make the safe path the default.** Use local or disposable test targets where
   needed; do not deploy or cause real external effects without authorisation.
6. **Choose the smallest fitting profile.** Inspect code, requirements and hosting
   first. Load the sibling `static-web-delivery` skill for browser-only static
   applications; load `service-backed-delivery` only for real server-side runtime,
   identity, persistence or secrets. A local static HTTP server is not a backend.
   Read this core once for the lifecycle, then the selected profile for its
   architecture and checks; do not copy core guidance into profile documents.

## When asked to bootstrap a new project

1. Read [method/01-overview.md](method/01-overview.md),
   [method/02-document-model.md](method/02-document-model.md), and
   [method/07-adoption-checklist.md](method/07-adoption-checklist.md).
2. Inspect the repository before selecting a profile. Ask only for information
   that cannot be discovered: product purpose, users, desired features, target
   browsers/hosting, privacy and data expectations, and what "released" means.
   Load [static-web-delivery](../static-web-delivery/SKILL.md) for browser-only
   static delivery, or [service-backed-delivery](../service-backed-delivery/SKILL.md)
   only when server-side needs are real. If both occur, document the specific
   boundaries and read only applicable sections of each profile.
3. Merge [templates/](templates/) contents and the selected profile's
   `templates/architecture/solution-pattern.md` into the target repository,
   keeping
   relative paths and preserving existing instructions, backlog and evidence.
   Instantiate `.template.md` files for named features/tasks only. Fill active
   `<!-- FILL -->` markers; explicitly record unknowns and unexecuted checks with
   linked decisions/tasks. Delete guidance comments once replaced.
4. Produce the first `F00` baseline task: inspect the real repository, record what
   actually exists versus what the docs claim, and establish the project's
   simplest repeatable local checks. Reuse real package scripts and workflows;
   do not create Docker, databases, Codespaces configuration or PowerShell/Bash
   wrappers unless the selected profile and project need them. Record any
   unavailable platform, browser or deployment check as pending.
5. Hand the user [prompts/implement.prompt.md](prompts/implement.prompt.md) as the
   prompt they paste to start every future session.

Include `architecture/alm.md` from the service skill only if the project adopts
its optional Azure ALM pattern. A static app can record host, artifact, routing
and release evidence in the high-level design and build plan. An existing
infrastructure migration is a separate tracked task.

## When asked to run a session in a method repo

Follow [method/04-session-protocol.md](method/04-session-protocol.md). In short:
read the tracker and contracts, resume or claim one task, implement a coherent
slice with tests and docs, run the exit checks, record evidence, update the
handoff, report.

Use the protocol's risk-based verification: focused checks during iteration,
required broad gates once the slice is stable, and no duplicate runs for unchanged
inputs. Stop when acceptance criteria and required gates have evidence. A docs-only
skill change normally needs document validation, not application/browser tests.

Keep sessions cheap: one task per session unless the user scopes more; read only
the claimed task's sections of the plan; write the tracker at claim and once after
verification; prefer automated viewport/keyboard tests over interactive browser
or screenshot sessions; archive Verified task detail out of the active plan.

For repository layout, CI/CD, environment, hosting or data lifecycle work, read
the selected profile and relevant project contract. Use the service skill's ALM
guide and `architecture/alm.md` only for a project adopting that Azure pattern.
Task and release status still belong only in the build plan.

Read the target's `architecture/solution-pattern.md` when establishing or changing
the app, hosting or test setup. Keep the project's actual documented commands
current; do not add redundant wrappers or infrastructure to satisfy an
inapplicable profile.

## Guides

| File | Purpose |
| --- | --- |
| [method/01-overview.md](method/01-overview.md) | Why the method works and what it optimises for |
| [method/02-document-model.md](method/02-document-model.md) | Every document, its owner, and what it must never claim |
| [method/03-task-design.md](method/03-task-design.md) | How to split a product into agent-sized tasks with exit checks |
| [method/04-session-protocol.md](method/04-session-protocol.md) | Start, work, verify, record, hand off |
| [method/05-evidence-and-status.md](method/05-evidence-and-status.md) | Verified vs released, and what counts as evidence |
| [method/06-safety-rails.md](method/06-safety-rails.md) | Destructive tests, secrets, deploys, autonomy boundaries |
| [method/07-adoption-checklist.md](method/07-adoption-checklist.md) | Drop-in checklist for the new project |

Profile-specific guides and templates live in the sibling
[static-web-delivery](../static-web-delivery/SKILL.md) and
[service-backed-delivery](../service-backed-delivery/SKILL.md) skills.

## Templates and prompts

- [templates/](templates/) — common documents to copy; add the chosen profile template.
- [prompts/](prompts/) — bootstrap, implementation and handoff prompts.
