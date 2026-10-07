---
mode: agent
description: Close out a session with evidence, tracker updates and a resumable handoff.
---

# Session close-out prompt

Use when a session is running low on context, or when work must stop mid-task.

```text
Close out this session against the delivery method.

Do not start new work. Finish or safely stop the current task, then record
everything needed for a cold session to resume.

1. State the starting commit and whether the tree was clean, and list any
   pre-existing user changes you preserved.
2. For each task you touched, set its correct state in
   architecture/features/build-plan.md. Set Verified only if its exit checks were
   actually executed and passed. If work is incomplete, leave it In progress and
   describe precisely where it stopped and what remains.
3. Fill the evidence column with the exact commands you ran and their outcomes
   with counts. Do not include any result you did not observe. Do not invent a
   commit, deployment or test result.
4. Record any design decision you made as a numbered decision, with the tasks it
   gates.
5. Add a dated delivery-log entry.
6. Update architecture/features/baseline.md with any new commands, tool versions,
   image digests, newly discovered limitations or pre-existing failures.
7. Write or update the task record document for substantial work.
8. If a requirement changed, update shared-contracts.md and every affected
   specification. Synchronise BACKLOG.md only if a feature is genuinely delivered,
   stating remaining limitations inline.
9. Rewrite the Current handoff section so another session can continue without
   asking me anything: completed task IDs, user-visible changes, in-flight work
   and its stopping point, checks and outcomes, blockers and pending release
   checks, and the exact next task with its first step.

Then report the same summary to me in the chat.
```
