# 07 — Adoption checklist

Work through this when standing the method up in a new project.

## Day one

- [ ] Merge `templates/` contents into the repository root, preserving relative
      paths and existing instructions, backlog wording, evidence and status.
      Instantiate `.template.md` files only for the actual features/tasks.
- [ ] Write `AGENTS.md`: 3–8 bullets, pointing at the instruction files and the tracker.
- [ ] Write `BACKLOG.md` from the user's own words. Do not tidy it into specs yet.
- [ ] Write `architecture/conceptual-model.md` — the domain nouns and the isolation
      boundary. Get the tenancy boundary right now; it is expensive later.
- [ ] Inspect code and requirements; copy the selected profile's solution-pattern
      template from [static-web-delivery](../../static-web-delivery/SKILL.md) or
      [service-backed-delivery](../../service-backed-delivery/SKILL.md) to
      `architecture/solution-pattern.md`. Do not add backend infrastructure to a
      static app without a concrete need.
- [ ] Write `architecture/high-level-design.md` — components, hosting, data flow,
      with any required departures recorded as decisions.
- [ ] Write `architecture/requirements-matrix.md` — requirements against personas.

- [ ] Only when adopting Azure ALM, read
      [the Azure ALM pattern](../../service-backed-delivery/method/08-alm-pattern.md)
      and complete the service profile's `architecture/alm.md` template.
      For a simple static app, document the real host, build artifact, path/routing
      requirements and release evidence in the high-level design and build plan.
      Do not provision or change deployment settings during bootstrap.

## Before any code

- [ ] Write one spec per feature in `architecture/features/`.
- [ ] Write `shared-contracts.md`, starting with the alignment-review table. Read
      all the specs together and list every contradiction you find, then resolve each.
- [ ] Write `build-plan.md`: dependency graph, task table with IDs, exit checks per
      task, decisions, empty delivery log, and an initial handoff pointing at `F00`.
- [ ] Copy the implementation prompt into `build-prompt.md`, localised with this
      project's paths, disposable-test command and scope fences.

## Localise these five things

1. **Local setup** — the simplest safe way to run and verify this actual stack.
      Reuse package scripts and existing tooling; add disposable services, wrappers
      or dev-container configuration only when required.
2. **Exit-check command list** — applicable checks only: build, unit, data/config,
      browser, integration or infrastructure. Put verbatim commands in `baseline.md`.
3. **Release gate** — what "released" means here, and the list of checks that can
   only pass in a real environment.
4. **Scope fences** — the explicit out-of-scope list for the current programme.
5. **Domain instruction files** — design system, privacy/security rules and
      generated-file handling, with `applyTo` globs.

## If adopting Azure ALM: before the first Azure release

- [ ] Implement required CI checks and guarded `sandbox`/`main` deployments from
      `architecture/alm.md`; coordinate optional frontend redeploys with the same lock.
- [ ] Configure isolated resource groups, environment settings and scoped OIDC
      trust. Confirm production uses managed PostgreSQL and sandbox cannot fall
      back to production credentials or data.
- [ ] Verify sandbox deployment, migrations, expected-image readiness and frontend
      routing. Record the final release commit and artifacts, including any rebuild.
- [ ] Establish production backup/restore, compatible rollback, monitoring and
      ownership; record actual recovery evidence and pending checks in the tracker.

## First session

- [ ] Run `F00` with the implementation prompt. Do not skip to a feature.
- [ ] Run and record the actual local start, build and test commands. For stateful
      systems, verify disposable setup and cleanup before destructive checks.
- [ ] Verify the relevant browser/device and deployment path. For static hosting,
      include base paths, assets and route behaviour when applicable.
- [ ] Record pre-existing failures and distinguish executed checks from pending
      platform/browser/deployment checks; do not claim unobserved success.

## Health checks after a few sessions

- Can a cold session start work from the handoff alone, without asking you anything?
- Does every `Verified` row name a command and an outcome?
- Is the build plan the single authority for status, with linked summaries aligned?
- Does the feature index still describe reality?
- Has any spec started contradicting `shared-contracts.md`?
- Are there `Released` claims with no deployment evidence? Fix immediately.

## Smells

| Smell | Fix |
| --- | --- |
| The tracker grows to thousands of lines | Move detail into per-task records; the tracker keeps one row of evidence |
| Sessions end with only a plan | Strengthen the "implementation, not planning" wording and name a concrete slice |
| Two documents both claim status | Delete the duplicate; the build plan wins |
| Exit checks written after the work | Write them when the task is created |
| Everything is `Blocked` | The tasks are too coupled; find safe independent substeps |
