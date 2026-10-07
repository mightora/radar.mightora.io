# Feature designs

The Technology Radar Live Editor already supports raw CSV editing, validation, a radar preview, sharing, and exports. Requested improvements are designed and tracked in the [build plan](build-plan.md); task progress and release status live there.

Start with the [shared contracts](shared-contracts.md), then follow the [build plan and delivery tracker](build-plan.md). The [implementation prompt](build-prompt.md) starts or resumes work. This index describes scope only; the tracker owns task and release status.

| Feature | Purpose |
| --- | --- |
| X01 | Choose an example from an accessible list instead of entering a name. |
| V01, V02 | Edit radar technologies visually while keeping CSV as the source of truth. |
| M01 | Use the editor comfortably on small screens. |
| Z01 | Zoom in and out on the radar preview. |
| D01 | Find a crawlable user guide from the application. |
| S01 | Improve search and answer-engine metadata without tracking. |

F00 establishes the baseline first. X01 and V01 then proceed independently; V02 depends on V01, M01 depends on X01 and V02, Z01 and D01 depend on M01, S01 depends on D01, and R01 verifies the full feature set and release readiness.
