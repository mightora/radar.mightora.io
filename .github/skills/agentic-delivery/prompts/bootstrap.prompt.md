---
mode: agent
description: Bootstrap the agentic delivery method in this repository.
---

# Bootstrap the agentic delivery method

Paste this into a fresh session in the target repository, with all three sibling
skills available (or their directories supplied explicitly).

```text
Set up the agentic delivery method in this repository using agentic-delivery.

Locate the agentic-delivery skill and call its directory CORE_ROOT. Its method/,
templates/ and prompts/ paths below are relative to CORE_ROOT. Read CORE_ROOT/SKILL.md,
method/01-overview.md, 02-document-model.md, 03-task-design.md,
07-adoption-checklist.md before doing anything else. Locate the sibling profile
skills by name; do not assume a profile until inspecting the repository.

Select the smallest architecture profile supported by the actual code and product
requirements. A static browser app can use static files, browser storage/APIs and
a static host; do not add a backend, sign-in, database, Docker, Codespaces config,
or PowerShell/Bash wrappers unless a concrete requirement justifies them. Preserve
existing behaviour and record material architectural decisions. After inspection,
read static-web-delivery/SKILL.md for browser-only static apps, or
service-backed-delivery/SKILL.md when server-side needs exist. Read both only for
genuinely mixed boundaries. Core owns workflow; the profile owns architecture
and applicable checks. Read service-backed-delivery/method/08-alm-pattern.md only
when adopting that optional Azure ALM pattern.

Phase 1 - understand the project. Inspect the actual repository: languages,
entry points, data/configuration, package scripts, tests, CI workflows, static
build output and deployment triggers. Do not trust README claims; check the code.
Then ask me, in one batch, only what cannot be discovered: product purpose, users,
desired features, target browsers/hosting, privacy/data expectations, release
meaning and out-of-scope items.

Phase 2 - write the document set. Merge CORE_ROOT/templates contents and the
selected profile's templates/architecture/solution-pattern.md into this
repository at the same relative paths. Preserve existing guidance, backlog
wording/status, designs and evidence; do not overwrite them wholesale. Use
feature-spec.template.md and task-record.template.md as sources for named
feature/task documents, not as active documents requiring fabricated content.
Fill every FILL marker in active documents with real content from phase 1.
For facts not yet known or executed, write an explicit unknown/not-run statement
and link a decision or task; never invent configuration or evidence. Delete the
guidance comments once replaced. Produce: AGENTS.md, BACKLOG.md,
architecture/conceptual-model.md, high-level-design.md, solution-pattern.md,
requirements-matrix.md, and architecture/features/ containing
README.md, one specification per feature, shared-contracts.md, build-plan.md, build-prompt.md and
baseline.md. Add architecture/alm.md only when the selected profile needs it. Add
domain instruction files with correct applyTo globs where useful.

For a service-backed project that adopts the Azure ALM pattern, copy the service
profile's templates/architecture/alm.md and fill in its environment, pipeline, data and
recovery contract. For a static project, omit architecture/alm.md unless the host
or release process needs a separate operations contract; describe the actual
static host, artifact, base path/routes and release evidence in the high-level
design and build plan. Preserve existing deployment behaviour. Do not provision
resources or change workflows during documentation setup.

Get shared-contracts.md right. Read all the feature specs together, list every
contradiction, overlap and unstated assumption in the alignment review table, and
resolve each one. That table is the point of the document.

Phase 3 - write the plan. Give every task a stable prefixed ID, a dependency, and
concrete exit checks written now, not later. F00 is always the first task:
baseline inspection, repeatable checks and decisions that later work depends on.
Use disposable test resources only where stateful/destructive tests need them.
R01 is always last. Draw the dependency graph in
Mermaid. Record the scope fence.

F00 records and runs the actual local start, check, test and build commands.
Reuse package scripts and existing workflows. Do not create Docker/Compose,
dev-container configuration, environment templates or platform wrappers unless
the selected profile needs them. Verify applicable browser and deployment behavior;
record unavailable OS/browser/host checks as pending.

Phase 4 - localise the prompt. Fill build-prompt.md with this project's paths,
disposable-test command, preserved behaviours, real-external-effect list and scope
fence, so it can be pasted unchanged into every future session.

This bootstrap session defines the project-specific deliverables; F00 implements
and runs applicable setup/check work. Do not write application code in this
session. Do not mark anything Verified. Do not run destructive commands. Finish
by showing me the task table and F00 exit checks, and the exact prompt and document
path to start the first implementation session (agent session prompts are not
shell commands).
```
