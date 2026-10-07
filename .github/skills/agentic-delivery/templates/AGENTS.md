# Repository Guidance

<!-- FILL: keep this file short. It loads into every agent session. 3-8 bullets. -->

- Before designing or modifying <!-- FILL: e.g. frontend UI -->, read and follow [<!-- FILL -->.instructions.md](<!-- FILL -->.instructions.md).
- Follow the delivery method in [architecture/features/README.md](architecture/features/README.md). [architecture/features/build-plan.md](architecture/features/build-plan.md) is the only owner of task and release status. Follow `architecture/alm.md` only if this project has adopted that contract.
- Keep [architecture/features/baseline.md](architecture/features/baseline.md) current as work progresses. Record meaningful implementation decisions, verification results, and any remaining limitations in the same change that establishes them.
- Preserve the existing product behavior and avoid unrelated changes. <!-- FILL: generated-artefact rule, e.g. "Generated frontend pages must be updated through their source templates/build scripts, then rebuilt and verified." -->
- Follow the selected profile in [architecture/solution-pattern.md](architecture/solution-pattern.md). Preserve existing behaviour; add infrastructure only for a demonstrated requirement.
- Keep the project's real local start, build and verification commands current in the README and baseline. Add platform wrappers only when needed.
- Run destructive stateful tests only against <!-- FILL: disposable runner command, or state that no destructive stateful tests exist -->. Never target shared or production data.
- Real external sends, pushes and deployments require explicit user authorisation. Record pending environment checks instead of claiming them passed.
