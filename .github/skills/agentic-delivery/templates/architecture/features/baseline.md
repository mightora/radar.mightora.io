# F00 baseline and local verification

<!--
This file records what ACTUALLY exists and what has ACTUALLY been executed.
Nothing aspirational belongs here. If a check did not run, say it did not run.
Append dated update sections rather than rewriting history.
-->

Initial inspection: <!-- FILL: date -->. Current F00 status is owned by the
[build plan](build-plan.md); this document records dated observations and evidence.

## Repository baseline

- Applicable `AGENTS.md` and instruction files: <!-- FILL -->
- Pre-existing uncommitted changes at start: <!-- FILL: list, and confirm they were preserved -->
- Stack and entry points: <!-- FILL: framework/runtime, app source, configuration and key files -->
- Runtime boundaries and fallbacks present in the code: <!-- FILL: browser storage, network calls, mock/offline behaviour or server-side behavior as applicable -->
- What the specs claim versus what the code actually does: <!-- FILL -->
- Frontend mock/offline fallbacks exist: <!-- FILL --> — do not mistake those for integration evidence.
- Deployment workflows and their triggers: <!-- FILL: which branch pushes deploy -->. No push or deploy performed.

## Deployment implementation baseline

- Project contract: <!-- FILL: reference ../alm.md when applicable, otherwise state the static host and release path -->
- Actual build/deployment workflow and triggers: <!-- FILL -->
- Actual hosting, routing/base path and configuration: <!-- FILL: no server secrets in static assets -->
- Drift or unimplemented requirements: <!-- FILL: link build-plan tasks/decisions -->
- Evidence boundary: <!-- FILL: source inspection, local execution or authorised deployed verification; never infer live settings from templates -->

## Local setup and data lifecycle

<!-- FILL: exact local start/build/test commands. If server-side schema exists, record
its migration lifecycle and disposable verification. Otherwise describe relevant
browser storage, imported data, generated artifacts and retention behavior. -->

## Local commands and observed profile

<!-- FILL: selected solution-pattern profile, actual local tooling and differences
from the intended architecture. Record evidence; do not invent infrastructure. -->

| Purpose | Actual command | Observed result and limitations |
| --- | --- | --- |
| Install dependencies | <!-- FILL --> | <!-- FILL: exact outcome, date/tool version --> |
| Start locally | <!-- FILL --> | <!-- FILL: URL and observed behavior --> |
| Automated checks | <!-- FILL --> | <!-- FILL: counts/outcome --> |
| Build/publish artifact | <!-- FILL --> | <!-- FILL: artifact path and outcome --> |

<!-- FILL: record relevant browser/platform checks, prerequisites, ports and cleanup.
For a static app, note when no wrapper, container or server-side data exists. -->

## Repeatable disposable integration setup (if applicable)

<!-- FILL: if stateful/destructive integration tests exist, record exact commands;
otherwise state "Not applicable: no destructive external state." -->

From the repository root, on a machine with <!-- FILL: prerequisite, if applicable -->:

```bash
<!-- FILL: exact commands -->
```

<!-- FILL: describe runner ownership and cleanup, if applicable. -->

Runtime/tool versions: <!-- FILL -->.

## Baseline results and constraints

- Runtime versions: <!-- FILL: local vs CI -->
- Build results: <!-- FILL: command -> outcome -->
- Test results: <!-- FILL: command -> counts -->
- Pre-existing failures: <!-- FILL: exact failure and why it is out of scope -->
- Missing local tooling: <!-- FILL -->

## Checks that remain release checks

<!-- FILL: the list of things only a real environment can verify, such as published
static-host routing or external integration. Omit inapplicable checks. -->

## <!-- FILL: date --> — <!-- FILL: task ID --> execution update

- Starting tree: <!-- FILL: commit, clean or not -->
- Commands run and outcomes: <!-- FILL -->
- New limitations discovered: <!-- FILL -->
