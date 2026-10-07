# 05 — Evidence and status

## Four distinct states

| State | Meaning | Who can set it |
| --- | --- | --- |
| Implemented | Code exists | Agent |
| Verified | The task's exit checks were executed and passed | Agent, with evidence |
| Ready for release | All of a feature's tasks verified, release checks identified | Agent |
| Released | Authorised deployment to the agreed release environment; release gates passed | Agent or human, with deployment evidence |

Conflating these is the single most damaging habit. "The worker is done" must be
written as "implemented and locally verified; deployed idle/scale-to-zero behaviour
remains a release check".

`Implemented` describes an observation, not a tracker task state. Tasks use
`Not started`, `In progress`, `Blocked` and `Verified`; features use `Not released`,
`Ready for release` and `Released`. `Ready for release` permits an authorised
release attempt; it does not waive outstanding deployed checks.

## What counts as evidence

Acceptable:

- the exact command, and its result with counts — `npm test` → `smoke tests passed`;
- the starting commit hash and the cleanliness of the tree;
- resolved tool versions and container image digests;
- named test files and the scenarios they cover;
- a screenshot or artefact path that was actually produced and inspected.

Not acceptable:

- "tests pass", "works as expected", "should be fine";
- a build succeeding, offered as proof of behaviour;
- a mocked external call, offered as proof of integration;
- a frontend offline/mock fallback rendering, offered as proof the API works;
- an invented commit, deployment or test result. Never fabricate these.

## Pre-existing failures

Record them in `baseline.md` at `F00` and reference them afterwards. A long-standing
unrelated failure must not silently become "the suite is red because of me", and
must not be quietly fixed inside an unrelated task either.

## Release checks

Keep a running list of things that can only be verified in a real environment:
published static-host routing and browser journeys, actual outbound email, real
webhook destinations, backend cold-start/scale behaviour, third-party client
compatibility, cost behaviour. Include only checks relevant to the selected profile.

They live in the feature progress table and the task records, not in the task's
own exit criteria. A feature can be fully `Verified` and still not be releasable.

## Keeping documents honest

- The feature index states plainly which features are designed and which are built.
- The backlog keeps `[d]` for designed and only flips to `[x]` on real delivery,
  with remaining limitations stated inline.
- Historical or retired designs are labelled as historical, with an explicit
  instruction not to restore them.
- When evidence contradicts a document, the document is corrected in that session.
