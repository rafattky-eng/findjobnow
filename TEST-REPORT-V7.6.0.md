# FindJob Now V7.6.0 — Test Report

## Checks performed in this build
- Reviewed the V7.5.0 source ZIP and the supplied V7.6.0 master instructions.
- Confirmed the prior live search queried Jobicy's legacy v2 endpoint and Remotive separately for only the first three selected roles.
- Updated Jobicy to the documented public `/api/jobs` endpoint and Remotive to `/api/remote-jobs`.
- Added source-level timeout and HTTP/network error reporting in the UI.
- Added six-hour local caching to reduce repeated feed calls.
- Added per-role synonym matching and all-selected-role filtering.
- Added additional official job-board / recruiter search links as search links, not vacancy cards.
- Removed wording that implied Indeed / Wantedly universally provide one-click applications.
- Updated the PWA service-worker cache version and visible version label.

## Not verified / known limitations
- Live API responses could not be verified in this build environment; provider CORS behavior may differ by browser and network.
- No Japan on-site vacancy API has been integrated. Japan job-board links are direct search links, not scraped listings.
- No Cloudflare Worker proxy has been deployed.
- External website translation depends on browser / translation service and cannot be forced by GitHub Pages.
- iPhone Safari visual interaction, actual job applications, resume uploads and service-worker refresh must be tested on the user's device after deployment.
- No live vacancy count is claimed by this report.

## Important
Do not treat this report as a claim that all 30 requested acceptance tests passed. It records the source changes and static checks performed only.
