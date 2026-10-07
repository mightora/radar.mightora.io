# Agentic delivery pack

A portable, project-agnostic extraction of the delivery method used in this
repository. Take it to another project to get the same working pattern:
spec-driven design, a single build plan that doubles as a delivery tracker,
evidence-based verification, and a stable prompt that any new agent session can
use to resume work. The method supports both small static browser applications
and service-backed products. It chooses the architecture from repository evidence
and product requirements instead of imposing infrastructure by default.

For a static app like this repository's Technology Radar, the profile is a
client-side application built and deployed as static files. There is no product
backend, account system, database, Docker requirement or cloud account for local
verification. Existing package scripts and deployment workflows define the real
checks. The optional service-backed profile retains the Docker/PostgreSQL and
Azure ALM guidance for projects that actually need those capabilities.

Choose the [static web profile](../static-web-delivery/SKILL.md) for browser-only
apps, or the [service-backed profile](../service-backed-delivery/SKILL.md) for real
server-side needs. Read this core skill once for the shared workflow and the
selected profile for its architecture contract and applicable checks.

## What is in the box

```
.github/skills/
  agentic-delivery/             Shared method, prompts, templates and validator
  static-web-delivery/          Static/browser contract and solution template
  service-backed-delivery/      Server contract, optional Azure ALM guide and template
```

## Installing it in another project

1. Copy all three sibling skill directories under `.github/skills/` in the target
  repository (or another supported skill location). Keep their relative layout
  so links resolve. A personal prompts folder alone does not ensure skill
  discovery; when in doubt, provide the three skill paths explicitly.
2. Read [the core entry point](SKILL.md), inspect the repository and load only
  the justified profile. A local static HTTP server does not select the service
  profile. The bootstrap prompt handles this routing.
3. Merge core templates and the selected profile's
  `templates/architecture/solution-pattern.md` into the target project; preserve
  instructions, backlog and evidence. Treat `.template.md` files as sources for
  named feature/task records.
   Run the bootstrap prompt: [prompts/bootstrap.prompt.md](prompts/bootstrap.prompt.md).
   It interviews you, then writes the document set into the repository.
4. From then on, start every implementation session with
   [prompts/implement.prompt.md](prompts/implement.prompt.md).

Create `architecture/alm.md` from
[the optional ALM template](../service-backed-delivery/templates/architecture/alm.md) only when adopting the
service-backed Azure ALM pattern. A static app can record its host, build artifact,
base-path/routing behaviour and release gate in the high-level design and build
plan without inventing an Azure ALM document. Azure, Bicep and managed PostgreSQL
are optional service-backed patterns; documenting them does not implement or
authorize infrastructure changes.

### Portable validation

Requires Python 3.10 or newer; no packages or cloud credentials are needed. Run
from any directory with the copied pack path:

```text
python .github/skills/agentic-delivery/scripts/validate.py
```

This checks composed template links, other local Markdown links, code fences,
required entries and all three skill frontmatter blocks. It does not validate live cloud
settings, remote links, agent discovery or application behaviour. For the generated
document set, stage the adopted documents (including root guidance, backlog and
architecture) in a temporary directory and run:

```text
python .github/skills/agentic-delivery/scripts/validate.py --root <staged-document-root> --localised
```

Keep the reusable skills and unused `.template.md` files outside that staged set.
The localised check rejects unresolved FILL markers and missing local targets.
Explicit unknowns must still be tracked; this check cannot establish release readiness.
Skill discovery is host-specific and is not tested by this validator. Explicit
skill paths work regardless of discovery support.

### The four prompts

| Prompt | When |
| --- | --- |
| [bootstrap.prompt.md](prompts/bootstrap.prompt.md) | Once, to create the document set in a new project |
| [implement.prompt.md](prompts/implement.prompt.md) | Start of every implementation session |
| [handoff.prompt.md](prompts/handoff.prompt.md) | End of a session, or when context runs low mid-task |
| [audit.prompt.md](prompts/audit.prompt.md) | Periodically, and before any release claim |

## The shape it creates in the target repository

```
AGENTS.md                              Short, always-on repository rules
BACKLOG.md                             The raw customer work list
.github/workflows/                     Existing CI/deploy workflows, when present
src/ or app source/                    Application source; follow the actual stack
public/ or assets/                     Static data and assets, when applicable
scripts/                               Existing build/check helpers, when useful
architecture/
  alm.md                              Optional Azure ALM contract (service profile)
  deploy/                             Optional infrastructure source
  conceptual-model.md                  Domain nouns and boundaries
  high-level-design.md                 Components, hosting, data flow
  solution-pattern.md                  Selected profile's contract and checks
  requirements-matrix.md               Requirements mapped to personas
  features/
    README.md                          Index; design vs shipped, honestly stated
    shared-contracts.md                Cross-feature policy, owned in one place
    build-plan.md                      Task tracker, evidence, decisions, handoff
    build-prompt.md                    The repo's own copy of the session prompt
    baseline.md                        What actually exists + repeatable check commands
    <feature>.md                       One spec per feature
    <task-id>-<name>.md                Implementation/verification record per major task
```

F00 documents and exercises the project's actual local start and verification
commands. For a small static project these may be existing package scripts and a
simple static file server; do not generate Docker, Compose, environment templates,
Codespaces configuration or PowerShell/Bash wrappers without a concrete need.
For service-backed projects, tailor the reference runtime, identity, database and
environment requirements to the actual product. In either case, command existence is not execution
evidence.

Application and infrastructure paths above are the target layout; the document
templates do not create a working application or deployable pipeline.

## Why it works

- A new session never has to reconstruct history: the tracker holds task state,
  evidence and an explicit "next task".
- Agents stop re-planning, because the prompt says "this is an implementation
  request, not another planning exercise".
- Cross-feature drift is caught early, because one document owns shared policy and
  every spec defers to it.
- Status stays truthful, because `Verified` and `Released` are different states and
  evidence must be commands with outcomes.
- The safe path is the default, so long autonomous runs stay reversible.

## Adapting it

The delivery method allows different frameworks and project sizes. Preserve
existing applications and follow explicit user requirements. Localise:

- the smallest suitable architecture profile and its boundaries,
- the real local start, build and automated verification commands,
- the exit-check command list for applicable layers only,
- the release gate (what "released" means for that product),
- any design-system or domain instruction files,
- host-specific base paths, routes, assets and deployment evidence for static apps,
- or, when adopting Azure ALM, environment identities, infrastructure, data
  lifecycle and recovery objectives in `architecture/alm.md`.

See [method/07-adoption-checklist.md](method/07-adoption-checklist.md).
