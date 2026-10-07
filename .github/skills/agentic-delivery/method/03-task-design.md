# 03 — Task design

## Sizing

A task is one coherent vertical slice that a single focused session can finish and
verify. If it cannot be verified in isolation, it is too big. If it produces no
observable behaviour or contract, it is too small — fold it into its neighbour.

Signals a task is wrong-sized:

- its exit checks cannot be written concretely → too vague,
- it touches every feature → it is really a contract change, put it in shared contracts,
- it is "add the database table" with no consumer → merge with the consumer,
- it needs three external providers chosen → split the decision out as a `D-xx`.

## Naming

Use short prefixed IDs grouped by workstream, so dependencies read naturally:

- `F00` baseline and decisions (always first),
- `F01`, `F02`, … foundation/shared services,
- one or two letters per feature workstream (`D` delivery, `E` email, `W` webhook,
  `A` API, `O` OAuth, `M` MCP, `S` sharing, `P` presentation),
- `R01` cross-feature regression and release readiness (always last).

IDs are stable forever. They appear in commits, task records, evidence and handoffs.

## `F00` is mandatory

The first task is never a feature. It is:

- inspect the actual application entry points, data/configuration, build/test and
  deployment workflows, and compare code against specs rather than trusting titles;
- establish the simplest repeatable local verification command list; use a
  disposable environment only when the stack has stateful or destructive tests;
- capture the current build/test baseline, including pre-existing failures;
- record decisions (`D-xx`) that later work depends on;
- write all of it to `baseline.md`.

Without `F00`, every later evidence claim is unanchored.

## Dependencies

Depends-on means the prerequisite is **verified**, not merely started. A task may
document a **safe independent substep** — work provably not dependent on the
blocked part — and proceed, as long as the tracker records why it is safe.

Draw the dependency graph in Mermaid in the build plan. State explicitly that it
describes technical order, not a requirement to run parallel agents.

## Exit checks

Every task gets exit checks written **before** the work starts. Good exit checks:

- map each acceptance criterion and meaningful regression risk to the cheapest
  reliable check, reusing existing coverage before adding tests;
- cover the happy path and relevant adversarial cases, not a universal checklist:
  malformed input or lost edits for an editor, concurrency or rollback for a
  stateful service;
- state what must be *absent* as well as present — no identity fields in external
  payloads, no secrets in logs, no development auth bypasses on privileged routes;
- distinguish checks that can pass locally from checks that require a real
  environment, and mark the latter as **release checks** rather than task checks.

Follow [the session protocol's verification policy](04-session-protocol.md#4-verify).
Name the focused iteration command and any final broad gates separately. Give
standing checks applicability conditions instead of requiring every suite for
every task. A wider browser/viewport matrix needs a layout, compatibility or
explicit acceptance reason; do not multiply every behavior by every viewport.
Record the stop condition: selected checks and mandatory gates pass, with evidence
for all acceptance criteria. Do not impose time limits that leave required checks
unmet, or weaken existing gates without an approved policy change.

Example shape:

> Exit: automated checks verify CSV parsing and validation, representative data,
> exports and share-link behaviour; browser checks verify the main edit/preview
> journey and the deployed base path. Record environment-only routing checks as
> release checks; source assertions do not prove the published app works.

## Decisions

When a choice would otherwise be silently made and later regretted, record it as a
numbered decision in the build plan: the question, the options, the choice, the
date, and the tasks that must not proceed without it. Routine decisions are made
by the agent and recorded in passing; only genuinely blocking, unrecoverable or
out-of-scope ones go to the user.

## Scope fences

State the out-of-scope list explicitly in the prompt and the tracker — pricing,
exports, write APIs, whatever. Agents expand scope helpfully unless told not to.
