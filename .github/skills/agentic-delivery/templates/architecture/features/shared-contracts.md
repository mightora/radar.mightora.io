# Shared feature contracts and alignment review

Status: <!-- FILL: e.g. Reviewed design baseline; implementation not verified. -->
Reviewed: <!-- FILL: date -->

This document defines the common rules for the [feature designs](README.md). Feature-specific documents define their own interfaces and journeys; this document owns cross-feature behaviour. The [build plan](build-plan.md) owns delivery status. <!-- FILL: name any historical documents that are background only and must not be restored. -->

## Alignment review

<!--
Read every feature spec together and list each contradiction, overlap or
unstated assumption. Resolve each one here, before it becomes code.
-->

| Finding | Resolution | Delivery coverage |
| --- | --- | --- |
| <!-- FILL: the contradiction or gap --> | <!-- FILL: the decided rule --> | <!-- FILL: task IDs --> |

No application behaviour was changed by this review. The defaults below are the implementation baseline and may be revised through a recorded design decision.

## Identity and policy (if applicable)

<!-- FILL: identity/isolation boundaries when they exist. For a static app with no
accounts or server authority, state that explicitly rather than inventing roles. -->

- <!-- FILL: e.g. `accounts.id` is the tenancy boundary. Memberships, personal grants and organisation-owned keys are distinct identities. -->
- <!-- FILL: applicable authorization, fallback and fail-closed rules. -->

## Authentication and sessions (if applicable)

<!-- FILL: selected authentication/session contract or state "Not applicable: no
accounts or authentication." Use the email challenge details only if the
service-backed profile and user requirements select them. -->

## Common action matrix (if applicable)

<!-- FILL: include a role/action matrix only if identities have different
permissions. State applicable external access rules. -->

| Action | <!-- FILL: Role A --> | <!-- FILL: Role B --> | <!-- FILL: Role C --> |
| --- | --- | --- | --- |
| <!-- FILL --> | Yes | Yes | No |

Implement this matrix explicitly; current route behaviour is not evidence that it already exists.

## Data visibility, storage and sharing

| Surface | Permitted data |
| --- | --- |
| <!-- FILL: browser/local storage, URL/share link, published page, API or notification as applicable --> | <!-- FILL: data visible and to whom --> |

<!-- FILL: document network access, data leaving the browser, user-controlled
content, consent and privacy limits. State when data is local-only. -->

## Lifecycle and revocation (if applicable)

<!-- FILL: what revocation stops (subsequent reads and attempts) and what it cannot do (retract delivered copies). State it plainly so no document promises live erasure. -->

## Shared data contract (if applicable)

<!-- FILL: versioned field names, filters, pagination strategy, bounded limits, and which interfaces must reuse them. -->

## Errors, diagnostics and privacy

<!-- FILL: error/diagnostic format, telemetry or audit fields and retention. Do not
add analytics/audit systems unless required; state whether data remains client-side. -->

## Out of scope

<!-- FILL: the explicit fence for this programme. -->
