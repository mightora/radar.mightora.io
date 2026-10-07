# Project ALM and environment contract

<!-- Use this Azure-specific contract only when the project selects the service-backed Azure ALM pattern. Static hosting alone does not require it. -->

<!-- FILL: complete during bootstrap using the service-backed-delivery skill's
method/08-alm-pattern.md. This owns configuration and operating procedures, not task or
release status. Record missing implementation as tasks in the build plan. -->

## Pattern and ownership

- Default: one product repository, GitHub Actions, Bicep at resource-group scope,
  Azure Container Apps, Azure Storage static frontends, and Azure Database for
  PostgreSQL Flexible Server in production.
- Product / repository / resource-name slug: <!-- FILL -->
- Service and release owner: <!-- FILL -->
- Subscription, region and data residency: <!-- FILL: non-secret identifiers only -->
- Exceptions and rationale: <!-- FILL: none, or decision IDs and affected requirements -->

Use the [solution pattern](solution-pattern.md) for application/login and local
testing requirements, the [high-level design](high-level-design.md) for components,
the [build plan](features/build-plan.md) for all implementation/release status, and
the [baseline](features/baseline.md) for executed checks and limitations.

## Repository map

| Concern | Project path |
| --- | --- |
| Backend source / container build | <!-- FILL: e.g. backend/src/, backend/Dockerfile --> |
| Frontend source / generated-page templates | <!-- FILL --> |
| Schema / ordered migrations / runner | <!-- FILL --> |
| Disposable integration runner | <!-- FILL --> |
| Local stack and start/stop scripts | <!-- FILL --> |
| CI / main deployment / optional frontend redeploy | <!-- FILL --> |
| Bicep entry point / resources / optional jobs | <!-- FILL --> |

## Environments

| Target | Source | Azure group / hosting | Database | Data policy |
| --- | --- | --- | --- | --- |
| Local | Working branch | Local processes / Docker | Persistent local PostgreSQL | Synthetic developer data |
| Disposable | Test runner / PR CI | Ephemeral local or CI containers | Fresh PostgreSQL each run | Destructive checks; cleanup by runner |
| `sandbox` | `refs/heads/sandbox` | <!-- FILL: rg-<product>-sandbox, host --> | <!-- FILL: container with Azure Files or managed PostgreSQL --> | Synthetic acceptance data; no destructive suites |
| `production` | `refs/heads/main` | <!-- FILL: rg-<product>-production, host --> | Azure PostgreSQL Flexible Server | Durable customer data; no demo seed |

- PostgreSQL major / extensions / image version policy: <!-- FILL -->
- Runtime versions shared by local, CI and containers: <!-- FILL -->
- Per-environment API, frontend and auth return URLs: <!-- FILL -->
- Frontend base path, CORS and optional edge/custom domain: <!-- FILL -->
- Container resources, replica bounds and operating budget: <!-- FILL -->
- Production network access, TLS verification and runtime DB role: <!-- FILL -->
- Sandbox volume ownership and non-overlapping DB revision procedure: <!-- FILL: or not applicable with managed sandbox -->

## Branches, configuration and identity

- Promotion path: feature branch -> reviewed sandbox -> reviewed main. Revalidate
  the final release SHA and synchronise production fixes back into sandbox.
- PR checks, branch protections and environment branch rules: <!-- FILL -->
- Manual dispatch guard: allow only the matching main/production or
  sandbox/sandbox pair, including frontend-only redeploys; reject all other refs.
- Per-environment deployment identity and resource-group RBAC: <!-- FILL -->
- OIDC issuer, audience and exact subject for each environment: <!-- FILL: use this repository's configured claims; no token values -->
- Runtime managed identities, ACR pull and Key Vault consumption: <!-- FILL -->
- Required environment variable names: <!-- FILL: Azure IDs, public URLs, product configuration -->
- Required environment secret names: <!-- FILL: database password, application keys, optional provider credentials; names only -->
- Secret source, runtime injection and rotation/retention procedure: <!-- FILL -->
- Frontend public build variables: <!-- FILL: no backend credentials -->

## One-time bootstrap runbook

<!-- FILL: project-specific commands/procedure, prerequisites and operator role.
Do not execute provisioning as part of documentation bootstrap. -->

1. Register required Azure providers, including PostgreSQL for production.
2. Create the two resource groups and scoped deployment identities/permissions.
3. Configure GitHub Environments, branch rules and OIDC federated credentials.
4. Populate environment variables/secrets; retain encryption keys across releases.
5. Deploy sandbox, record outputs, verify its frontend/API/database and isolation.
6. Complete production release gates, deploy, verify and record release evidence.

## Deployment contract

| Stage | Project command or workflow/job | Success criterion |
| --- | --- | --- |
| Validate | <!-- FILL --> | Locked build, applicable tests, disposable migrations and Bicep compile pass |
| Select / preflight | <!-- FILL --> | Allowed ref, correct GitHub Environment, required values present |
| Provision | <!-- FILL --> | Resource-group Bicep succeeds, preserves existing API image, emits required names/URLs |
| Build / publish image | <!-- FILL --> | Source SHA and immutable image digest recorded |
| Deploy / migrate | <!-- FILL --> | Expected revision ready, migrations complete; no production seed |
| Verify API | <!-- FILL --> | Bounded readiness check proves application and expected revision |
| Publish frontend | <!-- FILL --> | Correct environment API/base path, assets, deep links and domain |
| Smoke / evidence | <!-- FILL --> | Agreed user journey passes; evidence linked in the build plan |

- Triggers and path-filter policy: <!-- FILL: include all shared build/deploy inputs -->
- Deployment concurrency shared across workflows: <!-- FILL -->
- Image/artifact strategy: <!-- FILL: build per environment or verified digest promotion -->
- First-deploy placeholder handling and verification: <!-- FILL -->
- Bicep parameter-file cleanup and secret masking: <!-- FILL -->
- Migration execution point, lock/ledger and long migration procedure: <!-- FILL -->
- Optional workers: <!-- FILL: deployment stage, schedule, identity, enablement and idle-API check; or none -->

## Operations, rollback and recovery

- Monitoring, alert routing, log retention and responsible operator: <!-- FILL -->
- Backup retention, HA choice and geo-redundancy decision: <!-- FILL -->
- Recovery point / recovery time objectives: <!-- FILL -->
- Restore into a separate target and controlled cutover procedure: <!-- FILL -->
- Retained images/frontend artifacts and compatible application rollback: <!-- FILL: include migration-ledger compatibility and previous revision selection -->
- Partial release recovery: <!-- FILL: API succeeds/frontend fails, or migration fails; identify actual component versions -->
- Forward-fix or data-recovery procedure for incompatible schema changes: <!-- FILL -->

## Required evidence and adoption gaps

<!-- FILL: link tasks and evidence in features/build-plan.md / baseline.md.
Do not check off work here or duplicate their status. -->

Require evidence for disposable provisioning/cleanup, fresh and upgraded migration
paths, sandbox deployment and isolation, production TLS/identity settings,
expected-image readiness, frontend/auth routing, any scheduled worker, and a
restore/rollback rehearsal. Record exact commits, image digests, migration level,
workflow runs and commands/outcomes. Local or mocked checks remain distinct from
deployed checks. Record every unimplemented guard or exception as a task/decision;
documenting this contract does not establish compliance or a production release.
