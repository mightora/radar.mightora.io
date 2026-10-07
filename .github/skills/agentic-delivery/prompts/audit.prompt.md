---
mode: agent
description: Audit a method repository for drift, false status claims and contract contradictions.
---

# Method audit prompt

Run occasionally, and always before claiming a feature is ready for release.

```text
Audit this repository against the agentic delivery method. Do not change
application code. Report findings, then fix only the documentation defects.

Check and report on each of the following:

1. Single source of status. Does anything other than
   architecture/features/build-plan.md independently own task or release status?
   Linked index/backlog summaries and dated evidence records are allowed; flag
   stale summaries or competing trackers.
2. Evidence quality. For every row marked Verified, does the evidence name an
   actual command and an outcome with counts? Flag any row justified only by
   "tests pass", a successful build, or a mocked external call.
3. Verified versus released. Flag anything described as done, live, shipped or
   released without deployment evidence. Flag any release check that has quietly
   been dropped.
4. Contract drift. Read shared-contracts.md and every feature specification
   together. List contradictions and implementation drift. Verify role/action
   enforcement only when the product has identities or differentiated access;
   check client-side data/privacy contracts for static apps.
5. Index honesty. Does architecture/features/README.md describe reality? Does
   BACKLOG.md use [x] only for genuinely delivered items, with limitations stated?
6. Baseline currency. Are the local start/build/test commands in baseline.md still
   real? Are pre-existing failures still listed, and still pre-existing?
7. Handoff quality. Could a cold session start from the Current handoff alone?
   Name anything it would have to ask about.
8. Safety. For systems with destructive stateful tests, confirm the runner guards
   and applied-migration immutability. For every profile, confirm no credentials
   or private secrets were committed; check client-side privacy and URL sharing
   disclosures where relevant.

9. Solution pattern. Check that architecture/solution-pattern.md selects the
   smallest profile fitting actual requirements. For static apps, verify built
   assets, base paths/routes, browser behavior and local-only/privacy claims. For
   service-backed apps, verify their applicable auth, data, runtime and platform
   checks. Do not report absent backend infrastructure as a defect when it is not
   required.

10. ALM alignment. If architecture/alm.md exists or the project has meaningful
   infrastructure, compare it with workflows and deployed configuration. Check
   only applicable environment, deployment, data and recovery requirements.
   For a static host, verify its build artifact, routing/base path and release
   evidence instead. Distinguish source configuration from verified live settings;
   do not invent ALM gaps for projects that need no separate ALM contract.

For each finding give: the file, the problem, and the minimal correction. Apply
the documentation corrections. Raise anything that needs a code change as a new
task in the build plan rather than fixing it here.
```
