# FindJob Now V9.0.1 — Search hang hotfix

## Critical fix
- Fixed a fatal variable-name error in the live search completion object (`failed` was referenced although the collected array was named `failures`). This exception occurred before `_liveBusy` was reset, leaving the UI stuck on “Searching…”.
- Added an outer `try/catch/finally` so unexpected search errors are reported and the busy state is always cleared.
- Isolated each source failure so one source cannot stop other feeds.
- Added a per-source 10-second timeout covering both response retrieval and JSON parsing.
- Added visible source progress (completed / total) while feeds are checked.

## Japan-only eligibility
- Removed broad APAC / worldwide / anywhere labels as sufficient evidence of Japan eligibility.
- A vacancy is retained only when its location explicitly identifies Japan or a Japanese location, or when a remote location is accompanied by an explicit Japan eligibility indication in the job text.
- Greenhouse company labels now use proper company display names rather than title-cased board slugs.

## Honest reporting
- Distinguishes all-feeds-unavailable from a successful search with zero Japan-eligible matches.
- Keeps board search links separate from retrieved vacancies.
- Does not claim an application method has been verified when the source does not provide that information.

## Deployment
- Version bumped to 9.0.1 and service-worker cache bumped to `fj-v9.0.1`.
- Existing local storage key remains unchanged to preserve the user's saved profile and tracker data.

Copyright © 2026 Rafat Kotaki. All rights reserved.
