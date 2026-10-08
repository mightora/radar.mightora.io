---
name: playwright-tests
description: "Use when creating, updating, selecting, or debugging Playwright browser tests in this repository. Add only tests that verify the behavior or acceptance criteria of the work currently being undertaken."
---

# Playwright Tests

Use this skill for browser-test work in this repository. Keep test changes bounded to the current task; do not add speculative coverage for future work or rewrite unrelated tests.

## Scope and location

- Add browser specs only for current-task behavior or acceptance criteria, and only when an automated browser check is useful.
- Store Playwright specs in `tests/e2e/`. Follow the existing spec naming and fixtures; do not create another test tree or a generic test generator.
- Prefer updating the current task's existing spec when it is the natural owner. Create a new spec only when it gives a clear home to distinct task behavior.
- Assert externally observable behavior, including keyboard access, responsive layout, and accessibility when relevant to the task. Keep selectors and assertions specific and stable.
- Do not change product code, dependencies, CI, or test configuration merely to make a test easier unless the active task requires it.

## Running tests

- While iterating, run only the affected spec: `npx playwright test tests/e2e/<spec>.spec.js --reporter=dot`.
- Before handoff, follow the repository's required checks in `AGENTS.md`. The local full-suite runners are `scripts/run-all-tests.ps1` and `scripts/run-all-tests.sh`; they save logs, a summary, and a Playwright HTML report under a timestamped `test-results/local-*` directory.
- If a focused test fails, diagnose and repair the current task's slice, then rerun that same focused check before widening verification.
- Report exact commands and outcomes. Do not claim checks passed if they were not run; record unavailable browser or platform checks as pending.
- Use headed browser sessions or screenshots only to diagnose a concrete failure, not as a replacement for automated assertions.

## Test design

- Reuse the configured Chromium project and local built-site server in `playwright.config.js`.
- Encode required viewport sizes and keyboard journeys as assertions in the affected spec; do not add broad device matrices unrelated to the task.
- Keep test data local and deterministic. Do not upload user data, introduce tracking, or add destructive stateful tests.
- Avoid duplicating smoke tests, checks already covered by a more appropriate existing spec, and tests for unchanged behavior unless needed to guard a demonstrated regression.