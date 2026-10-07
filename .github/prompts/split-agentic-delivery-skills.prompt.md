---
mode: agent
description: Split the agentic delivery pack into shared, static-web, and service-backed skills.
---

# Split the agentic delivery skills

Use this prompt in the repository containing `.github/skills/agentic-delivery/`.

```text
Refactor the existing agentic-delivery skill pack into focused skills without
losing its working delivery method or duplicating shared guidance.

## Context and intent

The current `agentic-delivery` pack was designed around a full-stack default,
then updated to support both simple static browser apps and service-backed
products. This repository is a concrete static-app example: a client-side CSV
editor and SVG preview, built from static files, with no product backend,
account system, database, or secrets. Its package checks are `npm run check`,
`npm test`, and `npm run build`; its static deployment has repository-subpath,
asset/fetch-path, and hash-route considerations. CSV is handled in the browser;
share-link payloads are encoded, not encrypted.

The existing pack now has a static-browser profile and an opt-in service-backed
profile in `templates/architecture/solution-pattern.md`, but those concerns,
the common delivery method, prompts, templates, and Azure ALM guidance are still
bundled together. The goal is clearer skill discovery and less irrelevant context
for a static project. Keep the delivery process itself reusable across profiles.

## Proposed skill boundaries

1. `agentic-delivery` remains the shared core. It owns the common spec-driven
   workflow: document model, feature/task planning, single build tracker, task
   states, verification evidence, session protocol, handoffs, universal safety
   rules, and shared prompts/templates. Its entry point should explain when and
   how to load a profile skill. It must not impose backend, database, Docker,
   authentication, Azure, or platform-wrapper requirements on every project.
2. `static-web-delivery` owns the static-browser profile: static build and publish,
   local development, browser-side data/privacy boundaries, import/export and URL
   sharing considerations, generated artifacts, browser checks, routing/base-path
   behavior, and static-host release verification. Use this repository's radar
   as a concise example, not as a blanket requirement for other static sites.
3. `service-backed-delivery` owns the service-backed profile: API/runtime concerns,
   server-side identity and authorization, persistent data and migrations,
   containers/disposable integration environments, and applicable local/CI checks.
   Keep Azure/PostgreSQL ALM guidance optional within this profile; do not make
   Azure a requirement for all service-backed projects.

Do not create a separate Azure skill unless repository evidence shows the Azure
ALM material is independently reusable and the split reduces, rather than adds,
confusion. Do not duplicate core delivery docs into both profile skills: link to
the shared core and give each profile only its own contract, templates, and
workflow details.

## Work

1. Inspect the current skill tree, all internal Markdown links, the pack validator,
   and repository Git status before editing. Preserve existing user changes and
   avoid touching application code.
2. Decide which existing files belong to the core, static profile, or service-
   backed profile. Move or rewrite only what is needed. Preserve the full existing
   delivery workflow and the optional full-stack requirements; do not silently
   discard detailed safety or ALM material.
3. Create valid `SKILL.md` frontmatter for each skill. Use clear, distinct
   descriptions that make discovery work: common delivery lifecycle for the core;
   static/browser-only apps for the static profile; API/auth/database/container
   products for the service-backed profile. Avoid vague overlap in trigger wording.
4. Establish explicit routing: the core bootstrap should inspect the repository
   and select the smallest justified profile; static projects should load the
   static skill; only projects with real server-side needs should load the
   service-backed skill. Explain how a session loads both core and profile without
   repeating the same instructions.
5. Update the pack README, installation/adoption instructions, prompts, templates,
   and all links to match the new locations. Do not leave stale paths or imply
   that `architecture/alm.md`, Docker, PostgreSQL, sign-in, or multiple platform
   launchers are mandatory for a static app.
6. Review the validation script. Update its required-file/frontmatter checks so
   it validates the new skill layout and internal links without hard-coding the
   old single-skill shape. Keep it stdlib-only unless there is a clear existing
   reason to add a dependency.
7. Search the finished tree for contradictory default mandates, duplicate sources
   of truth, stale paths, unresolved template markers in active examples, and
   duplicated content that can drift. Keep the changes scoped to the skill pack.

## Constraints

- Preserve the one authoritative task/release tracker, evidence rules, and safe
  autonomy boundaries from the current method.
- A static local HTTP server is a development tool, not a product backend.
- Do not add infrastructure to the radar application itself.
- Preserve opt-in service-backed guidance, including database safety and Azure
  ALM detail; make applicability explicit rather than deleting it.
- Preserve unrelated user changes. Do not commit or deploy.
- Prefer a small, navigable skill set over extracting every topic into a separate
  skill. Keep existing skill names where they still fit.

## Verification and report

Run the updated skill-pack validator and any focused documentation/link checks.
Run `git diff --check`. If application files remain untouched, do not run the
application test suite solely for reassurance. Report the final skill tree,
responsibility boundaries, files moved/updated, validation results, and any
remaining decisions or limitations. Do not claim external skill discovery was
verified unless you actually tested the host agent's discovery behavior.
```
