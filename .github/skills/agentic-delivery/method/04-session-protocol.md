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
  patterns; verify affected mobile, keyboard and routing behaviour for frontend
  work, preserving all explicitly required coverage.
- Keep the project's real startup and verification commands current when behaviour
  changes. Add platform-specific wrappers only when the selected profile needs
  them. Record actual browser, operating-system and deployment results separately.
- For a new external protocol, provider or package, check current official
  documentation and record the chosen version and compatibility.
- Make routine decisions and record them. Ask only for information that
  materially blocks progress, or for actions outside the authorised scope.
- Never introduce extra approval steps for local, reversible work.

## 4. Verify

- Before testing, name the changed behavior, its main regression risk and the
  cheapest check that could expose a defect. Select checks by affected surface:

  | Change | Default verification |
  | --- | --- |
  | Docs, prompts or skills only; no shipped output changes | Relevant document/link/frontmatter validator; no application build or browser suite. |
  | Local behavior fix | Focused regression test and applicable syntax/type checks. |
  | UI or layout | Affected browser journey and relevant visual/keyboard checks, using the selected profile's guidance. |
  | Shared contracts, startup, build, dependencies or cross-feature behavior | Affected consumers plus broader regression checks justified by the blast radius. |
  | Release candidate | All required release checks; deployment still requires authorization. |

- Record the selected checks and why broader checks are unnecessary in the task's
  evidence. These defaults never waive explicit task exit checks, standing gates,
  CI requirements or requested browser/viewport coverage. If a mandatory gate is
  disproportionate, propose a separate policy change rather than silently skip it.
- During iteration, run the smallest relevant check after an edit. On failure,
  fix and rerun that check before expanding coverage. Run required broad gates
  once the slice is stable, not after every edit.
- Reuse passing evidence only while relevant source, tests, configuration,
  dependencies and environment remain unchanged. Record the revision or worktree
  scope and command; invalidate affected results when those inputs change.
  Documentation-only evidence updates do not invalidate application results.
- Inspect command composition: if a test command builds first, count that build
  instead of running it separately. Prefer existing tests and extend them only
  for an uncovered acceptance criterion or regression risk; do not duplicate the
  same assertion across unit, browser and manual checks without a distinct reason.
- Stop when selected checks and required gates pass and acceptance criteria have
  evidence. Do not add another suite, browser pass or screenshot merely for
  reassurance. Expand only for a failure, uncovered risk or explicit requirement.
- Use the disposable environment when tests mutate state. Use controlled local
  receivers and mocks for external integrations where applicable.
- Record commands verbatim and their outcomes with counts (`78/78 passed`).
- Distinguish out-of-scope checks (with rationale) from required checks that could
  not run (pending or blocked). Never infer a result or mark a task verified while
  a required local exit check remains unmet.

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
