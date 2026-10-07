# High-level design

Status: <!-- FILL: current / historical. If historical, say so plainly and instruct that it must not be restored. -->

## Delivery pattern

Select the smallest fitting profile from [solution-pattern.md](solution-pattern.md).
<!-- FILL: static-browser or service-backed profile, framework, hosting and any
requirements that justify backend/auth/data infrastructure. Link material decisions. -->

## Components

```mermaid
flowchart LR
    <!-- FILL -->
```

| Component | Responsibility | Hosting | Scaling |
| --- | --- | --- | --- |
| <!-- FILL --> | <!-- FILL --> | <!-- FILL --> | <!-- FILL --> |

## Data flow

<!-- FILL: the main request and background paths. -->

## Authentication and authorisation (if applicable)

<!-- FILL: each distinct identity type and where it is valid. Defer detail to shared contracts. -->

## Storage and client-side data (if applicable)

<!-- FILL: engine, schema strategy, migration mechanism, retention. -->

## Deployment and environments

If this project has a separate `alm.md` contract, it owns environment/branch
mapping, infrastructure, identity/configuration, pipeline stages and operations.
Otherwise document the static host, artifact and release path here and in the build
plan.

<!-- FILL: concise deployment topology. For static hosting, include build output,
base path/routes, asset/data fetch paths and the relevant workflow. For service-
backed deployments, link alm.md and describe only the applicable runtime setup. -->

## Non-functional targets

| ID | Target | How it is verified |
| --- | --- | --- |
| <!-- FILL --> | <!-- FILL --> | <!-- FILL: note if only a real environment can verify it --> |
