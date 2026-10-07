# 06 — Safety rails

Long autonomous runs are only safe if destructive paths are closed by default.
Apply database and migration requirements only to projects that actually use them.

## Disposable test environments (when applicable)

Stateful integration suites can be destructive. Never point one at a shared
development, sandbox or production system. A static app with no external state
does not need a database container or disposable-environment runner.

Provide a runner script that:

- provisions its own container, anonymous volume, random password and a
  dynamically allocated loopback port;
- overrides the caller's connection string, SSL, seed and encryption settings so
  an inherited environment variable cannot leak a real target;
- requires an explicit marker (for example `APP_DISPOSABLE_TEST=1`) **and** an
  exact database naming pattern before destructive suites will run — a name merely
  containing "test" is not enough;
- supplies no real provider credentials;
- removes only what it created, in a `finally` block;
- runs database suites serially when they truncate shared tables.

Record the exact command in `baseline.md`, and pin the image major version plus the
resolved digest once one has been observed.

## Database migrations (when applicable)

- The destructive base schema is for empty-database bootstrap only, never upgrade.
- Ordered, additive SQL files with a checksummed ledger, one transaction each,
  under the same advisory lock as startup.
- Applied files are immutable. Fix forward with a new file.
- Verify both a fresh database and a representative upgraded database before
  marking migration work verified.
- Note rollback honestly: rolling back application code may restore old permissive
  behaviour, which is not a safe security rollback.

## External effects

Real emails, real webhook calls, pushes and deployments stay inside explicit user
authorisation. During development use controlled local receivers and mocks, and
record the environment or client checks that remain pending rather than claiming
they passed.

Inspect CI workflows before any authorised push — a push to a watched branch may
itself deploy.

## Secrets and data

- Never log, echo or commit credentials, tokens or connection strings.
- Audit records stay metadata-only: identifiers, operation, outcome, request ID,
  timestamp. No emails, URLs, tokens or user content.
- Default to minimising personal data in external payloads and notifications.
  Define explicitly permitted fields, recipients, consent and retention in shared
  contracts. Authentication mail necessarily contains its intended recipient and
  one-time credentials; keep these out of logs and unrelated notifications.
- Outbound destination credentials are separate identities; never forward a
  platform token to a third party.

## Autonomy boundary

Do freely: edit files, add tests, run local builds and disposable suites, refactor
within scope, make and record routine decisions.

Stay within existing user authorisation for irreversible or external actions;
do not request the same permission again. Routine in-scope file deletion and
cleanup of runner-owned disposable databases are reversible implementation work.
Seek authorisation when absent for destructive shared-data deletion, branch deletion, `git push --force`, `git reset --hard`,
amending published commits, pushing, deploying, dropping databases, sending real
messages, changing shared infrastructure, adding a new paid provider, or anything
outside the recorded scope fence.

Do not use a destructive shortcut to get unblocked, and do not bypass safety
checks such as `--no-verify`. Do not discard unfamiliar changes in the working
tree; they are probably the user's.
