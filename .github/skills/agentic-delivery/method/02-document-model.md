# 02 — Document model

Every document has exactly one owner concern. Overlap is the main failure mode, so
each entry below states what the document must **never** claim.

## `AGENTS.md` — always-on repository rules

Short. Three to eight bullets. Loaded into every session automatically, so it must
stay small. Point at the bigger documents rather than duplicating them.

Contains: the pointer to design/domain instruction files; the instruction to keep
the baseline and tracker current in the same change; the instruction to preserve
existing behaviour and avoid unrelated changes; any build-artefact rule (for
example "generated pages are edited through their source templates, then rebuilt").

Never contains: feature detail, task status.

## `BACKLOG.md` — the customer work list

Raw, unpolished, in the user's own words. Items get markers: `[ ]` not started,
`[d]` designed (a spec exists), `[x]` actually delivered. Links to the specs.

Never contains: implementation status detail. Only flip `[x]` when the feature
genuinely meets its release gate, and state remaining limitations next to it.

## `architecture/conceptual-model.md`, `high-level-design.md`, `requirements-matrix.md`

Durable background. The nouns of the domain and their boundaries; the components,
hosting and data flows; requirements mapped to personas and journeys.

Never contains: current progress. These may describe retired designs — say so
explicitly, so a future session does not "restore" them.

## `architecture/solution-pattern.md` — selected application and test delivery

Owns the selected profile and its applicable requirements. A static-browser app
needs no backend, sign-in, database, Docker or per-platform launchers unless a
real requirement establishes the need. A service-backed app may use the optional
Docker/PostgreSQL pattern. Project choices live in the high-level design and
shared contracts; record material decisions without treating inapplicable
profiles as departures.

Never contains: claims that scripts, authentication or hosting already work.
Execution evidence belongs in the baseline and task records.

## `architecture/alm.md` - optional environment and release contract

The project's adoption of [the optional Azure service-backed pattern](../../service-backed-delivery/method/08-alm-pattern.md).
Create it only when that pattern is selected. A simple static app can document
its host and release gate in the high-level design and build plan instead. When
used, this file owns environment mapping, resources, identities, configuration,
pipeline stages and operations; link implementation gaps to the build plan.

Never contains: a second task/release tracker or unexecuted verification claims.
The baseline and task records hold evidence; the high-level design links here
rather than duplicating the deployment contract.

## `architecture/features/README.md` — the index

One table of features and purposes, plus a plain-English statement of what is
designed versus implemented versus released. Points at shared contracts, the build
plan and the prompt.

Never contains: task-level status.

## `architecture/features/shared-contracts.md` — cross-feature policy

The highest-leverage document. Owns anything more than one feature touches:

   - the tenancy/isolation boundary and identity resolution, when present,
   - the role/action matrix, when users or services have different privileges,
   - visibility rules per surface,
   - lifecycle and revocation semantics, when applicable,
   - shared data contracts, field naming, versioning and limits,
   - error, audit and privacy rules relevant to the product.

For a small static app, keep this document short: record its shared data formats,
browser storage and sharing/privacy rules, or state that no cross-feature contract
is needed. Do not invent tenants, roles, sessions or audit requirements.

Open it with an **alignment review** table: each finding, its resolution, and the
features it affects. That table is where contradictions between specs get settled
before they become code.

Never contains: implementation status. If a requirement changes, this document and
every affected spec are updated in the same slice as the code.

## `architecture/features/<feature>.md` — feature specs

Customer requirements, journeys, interfaces and acceptance criteria for one
feature. Defers to shared contracts for anything cross-cutting.

Never contains: task state, or a claim that it is built.

## `architecture/features/build-plan.md` — tracker (the centrepiece)

The only authoritative source of task and release status. Index/backlog summaries
may reflect it with links; baseline and task records preserve dated evidence,
not independent current status. Sections, in order:

1. **Header** — last updated, overall state, and the explicit **next task**.
2. **How to maintain this plan** — numbered rules the agent follows when editing it.
3. **Scope and dependencies** — a Mermaid graph of task dependencies.
4. **Feature progress** — feature, required tasks, release state, evidence.
5. **Task tracker** — a table: ID, task, depends on, state, evidence/blocker.
6. **Task details and exit checks** — per task, the concrete work and the checks
   that must pass before `Verified`.
7. **Decisions** — numbered, dated design decisions (`D-01`, `D-02`, …) with the
   task that must not proceed without them.
8. **Delivery log** — dated session entries of one or two lines; older entries
   move to the archive.
9. **Current handoff** — what was just done, what is in flight, and the exact next
   step, written so another session can resume cold.

Keep the plan small: it is read every session. When a task is `Verified`, move its
task details and older delivery-log entries to `architecture/features/delivery-archive.md`,
leaving only the tracker row with a short evidence summary. The archive is a
record, never a status source, and sessions do not need to read it.

Task states: `Not started`, `In progress`, `Blocked`, `Verified`.
Feature release states: `Not released`, `Ready for release`, `Released`.

## `architecture/features/build-prompt.md` — the session prompt

The repository's copy of the implementation prompt, in a fenced block, ready to
paste. It references task IDs and the handoff, so it stays valid between sessions.
Append a scope line to constrain a session.

## `architecture/features/baseline.md` — what actually exists

The F00 output and the living record of local verification. Contains the honest
inspection of the codebase, the repeatable test setup (exact commands), tool and
dependency versions, known pre-existing failures, and explicitly-still-pending
release checks.

Never contains: aspiration. If something was not executed, say it was not executed.

## `architecture/features/<task-id>-<name>.md` — task records

For substantial tasks, a record of what was implemented, the data/API contract it
established, the migration approach, the checks run with counts and outcomes, and
the gates that remain. These are what later tasks read instead of re-deriving the
design from code.

## Optional: domain instruction files

Files like `design-system.instructions.md` with YAML frontmatter (`name`,
`applyTo`, `description`) carry narrow, mechanical rules — branding, component
usage, styling tokens, generated-file handling. `applyTo` is tool-specific metadata, not a portable loading guarantee. Link
instruction files from `AGENTS.md` and read them explicitly when relevant; use
the target agent's supported discovery paths if automatic loading is required.
