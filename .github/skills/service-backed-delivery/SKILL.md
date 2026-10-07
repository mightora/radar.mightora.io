---
name: service-backed-delivery
description: >-
  Use for products with a real server-side API or runtime, server-enforced
  authentication/authorization, persistent database and migrations, or container
  integration environments. Covers applicable local/CI checks and optional
  Azure/PostgreSQL ALM. Load alongside agentic-delivery for shared lifecycle rules;
  not for browser-only static sites or local static HTTP development servers.
---

# Service-backed delivery

Read [agentic-delivery](../agentic-delivery/SKILL.md) for the shared document
model, single tracker, evidence, session protocol and safety boundaries. This
skill supplies only service-specific architecture and verification guidance.

Use [the service solution pattern](templates/architecture/solution-pattern.md)
as the target's `architecture/solution-pattern.md`; tailor its reference
Docker/PostgreSQL/email pattern to actual requirements. Copy common templates
from core separately. Containers and disposable databases are useful where
stateful integration tests demand them; do not invent an auth flow or a platform
launcher merely because the reference describes one.

For a project that adopts Azure ALM, read [the optional ALM guide](method/08-alm-pattern.md)
and also instantiate [the ALM template](templates/architecture/alm.md).
Azure is not a prerequisite for service-backed delivery. Keep service contract
details in the profile and task/release status only in the core build plan.