# Implementation prompt

Copy the prompt below into a new session in this repository. It starts or resumes the [build plan](build-plan.md); task IDs and the handoff determine the next work, so the prompt does not need rewriting after every delivery.

```text
Implement the features in architecture/features/build-plan.md.

First read applicable AGENTS.md instructions, architecture/features/README.md,
shared-contracts.md, the build plan's task table/decisions/current handoff, and
the feature specifications for the next ready task. Inspect git status and
existing changes before editing. Preserve unrelated user work. This extends the
current application; do not restart <!-- FILL: historical plan path --> or
restore its retired <!-- FILL: retired design --> design.

Treat this as an implementation request, not another planning exercise. Resume
any In progress task if it is still valid; otherwise start the next Not started
task whose dependencies are verified. If a task is Blocked, check whether its
recorded blocker has cleared. Complete one task per session unless this prompt
is scoped to more, delivering a coherent slice rather than stopping after a plan
or scaffold, then stop. Read only that task's sections of the build plan.
Continue independent ready work if a specific external dependency is unavailable.

Use the shared contracts for <!-- FILL: the cross-cutting rules, e.g. tenant
isolation, role checks, external-access policy, approval gates, lifecycle
events -->. Preserve existing <!-- FILL: behaviours that must not regress -->.
Do not broaden into <!-- FILL: explicit out-of-scope list -->.

Follow the selected profile in architecture/solution-pattern.md. During F00,
document and run the actual local start/build/test commands. Reuse the repository's
package scripts and workflows; add Docker, database services, environment files,
dev-container configuration or platform wrappers only when required by the
selected profile. Record browser, OS and deployment checks separately; never claim
a check passed because a script exists or another platform passed.

Before coding a task, mark it In progress and record the scope. Implement the
user-visible behaviour, data/configuration, documentation and meaningful tests
that apply to the selected architecture. Add a backend or migrations only when
the product requires them. Follow existing UI patterns, and verify affected mobile,
keyboard and routing behaviour for frontend work. For new external protocols,
providers or packages, check current official documentation and record the chosen
versions and compatibility. Make routine decisions and record them; ask only for
missing information that materially blocks progress or actions outside the
authorised scope. Do not introduce extra approval steps for local reversible work.

Use a confirmed disposable <!-- FILL: database/environment, or state "not
applicable" if checks have no destructive shared state --> for destructive tests:
<!-- FILL: which suites are destructive, or none -->. Never run them against a
shared development, sandbox or production environment. Run the build plan's
relevant checks and each task's exit criteria. Use local fixtures or controlled
receivers for external integrations where applicable. Actual <!-- FILL: real external effects --> and
deployments must stay within explicit user authorisation; record environment and
client checks that remain pending instead of claiming them passed. Do not publish
or deploy merely because code is ready, and inspect workflows before any
authorised push that may deploy.

Choose verification by changed surface and regression risk. Use focused tests
during iteration and run required broad gates once the slice is stable. Reuse
passing evidence only while relevant inputs are unchanged; count builds already
included in test commands. Docs-only changes outside shipped output normally need
document checks, not application/browser suites. Preserve explicit exit, standing
and CI gates. Stop when acceptance criteria and required gates have evidence;
record out-of-scope checks separately from required checks that remain pending.

Update architecture/features/build-plan.md when claiming the task and once after
verification: task state, short evidence and commands/results, decisions, a one-
or two-line delivery-log entry, feature release state and current handoff. Move
a Verified task's details to delivery-archive.md. Prefer automated viewport and
keyboard tests over interactive browser or screenshot sessions. Mark a task
Verified only when its exit checks pass. Keep
implemented/verified separate from released. Synchronise feature documents and
BACKLOG.md when a feature is actually delivered; preserve existing custom status
markers until there is evidence to change them. If a requirement changes, update
the shared contracts and every affected spec in the same slice.

At the end of the session, report completed task IDs, user-visible changes, checks
and outcomes, any remaining blockers or release checks, and the exact next task.
Leave a handoff that another session can resume without reconstructing your work.
```

To constrain a session, append a concrete scope such as: `For this session, complete F01 only.` To resume the plan, use the prompt unchanged; it takes the next ready task.
