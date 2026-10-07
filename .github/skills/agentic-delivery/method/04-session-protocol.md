# 04 — Session protocol

Every implementation session follows the same six phases.

## 1. Orient

- Read the applicable `AGENTS.md` and any instruction files matching the files
  you will touch.
- Read `architecture/features/README.md`, `shared-contracts.md`, and the build
  plan's task table, decisions and **current handoff**.
- Read the specs for the next ready task only.
- Inspect `git status` and any existing uncommitted changes. Assume they are the
  user's in-progress work and preserve them.
- Note the starting commit; it goes in the evidence.

## 2. Claim

- Resume the `In progress` task if it is still valid. Otherwise take the next
  `Not started` task whose dependencies are `Verified`. If a task is `Blocked`,
  check whether the recorded blocker has actually cleared.
- Mark it `In progress` and write the **actual** scope you intend to deliver,
  including what you are explicitly excluding.
- If a specific external dependency is unavailable, continue independent ready
  work rather than stopping.

## 3. Implement

- Deliver a coherent slice for the selected profile: browser behaviour, data/config,
  tests and documentation for a static app; add services and migrations only when
  the product actually has them. Do not stop after a scaffold or a plan.
- Reuse shared services rather than re-implementing policy. Follow existing UI
  patterns; verify mobile, keyboard and routing behaviour for frontend work.
- Keep the project's real startup and verification commands current when behaviour
  changes. Add platform-specific wrappers only when the selected profile needs
  them. Record actual browser, operating-system and deployment results separately.
- For a new external protocol, provider or package, check current official
  documentation and record the chosen version and compatibility.
- Make routine decisions and record them. Ask only for information that
  materially blocks progress, or for actions outside the authorised scope.
- Never introduce extra approval steps for local, reversible work.

## 4. Verify

- Run the task's exit checks and the build plan's standing checks.
- Use the disposable environment when tests mutate state. Use controlled local
  receivers and mocks for external integrations where applicable.
- Record commands verbatim and their outcomes with counts (`78/78 passed`).
- If something did not run, say so. Never infer a result.

## 5. Record

In the same change as the code:

- update the task row: state, evidence, commands and outcomes, paths or commit refs;
- set `Verified` only when the exit checks actually passed;
- update the feature progress table and release state if it changed;
- add a dated delivery-log entry;
- update `baseline.md` with new commands, versions or newly discovered limitations;
- write a task record document for substantial work;
- if a requirement changed, update `shared-contracts.md` and every affected spec;
- synchronise `BACKLOG.md` only when a feature is genuinely delivered.

## 6. Hand off

Rewrite the **current handoff** section so a cold session can continue. It states:

- the completed task IDs and user-visible changes,
- checks run and their outcomes,
- remaining blockers and pending release checks,
- the **exact** next task and its first step.

Then report the same summary to the user.

## Anti-patterns

- Producing another plan when the plan already exists.
- Marking `Verified` on the basis of a build passing.
- Editing an already-applied migration file instead of adding a new one.
- Claiming a feature is released because the code is ready.
- "Fixing" unrelated files, or reverting work you do not recognise.
- Leaving the tracker for "the end" and running out of session.
