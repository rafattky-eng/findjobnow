# FindJob Now V7.6.0

## Improvements
- Replaced the old Jobicy v2 remote endpoint with the current public `/api/jobs` endpoint.
- Changed Jobicy geographic coverage to APAC and Anywhere remote feeds; Japan eligibility is still limited by provider metadata.
- Changed Remotive to the documented `/api/remote-jobs` endpoint and a single cached feed request rather than up to three role-specific requests.
- Increased provider cache windows to six hours to reduce unnecessary calls and respect provider guidance.
- Added independent source status, cached/live indication, timeout / HTTP / network error reporting and separate vacancy counts.
- Expanded role matching with related-title synonyms and more tolerant title / description matching.
- Removed the old three-role Remotive query cap; all selected roles are checked against returned feed data.
- Expanded Japan job-board and recruiter search shortcuts.
- Removed misleading one-click / upload promises from generic job-board labels and descriptions.
- Added a header back button for app views and wizard steps.
- Reduced the size and moved the toast below the header so it does not obscure the app.
- Added external translation links and language indicators for structured-feed listings.
- Updated service-worker cache version to V7.6.0.

## Limitations
- The structured feeds are remote-job sources, not a comprehensive feed of Japan on-site vacancies.
- Japan job-board shortcuts open the provider's search page; they are not counted as retrieved vacancies.
- A GitHub Pages app cannot translate arbitrary third-party pages inside their own domains. External browser / translation tools are offered instead.
- Easy Apply, CV upload, email application and visa sponsorship must be confirmed on each individual vacancy.
- No Cloudflare Worker proxy was added; browser CORS support still depends on each provider.
