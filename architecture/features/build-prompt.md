# Implementation prompt

This is a human-facing launch prompt. Replace `<ID>` with the chosen task from the [build plan](build-plan.md) or its handoff, then paste the prompt into a new agent session. The build plan alone owns task and release status; [AGENTS.md](../../AGENTS.md) owns the session protocol. Agents do not need to read this file during implementation.

## Main prompt

```text
Implement <ID> from architecture/features/build-plan.md, then stop.
Follow the "Implementation sessions" rules in AGENTS.md.
Report: task ID, user-visible changes, checks and outcomes, pending items, next task.
```

## Cost tips

- Use a lighter model for docs or metadata tasks such as S01, and a stronger one for tasks with complex UI logic.
- If a session runs long, stop it, ask for a handoff update, and continue in a fresh session.
