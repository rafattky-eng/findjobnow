# FindJob Now V7.5.0 — Real jobs only

## Problem fixed
"Refresh live matches" always showed the same list because ~40 curated "Seed" entries (links to company home pages, not real postings) were added every time and dominated the results; only the first role was effectively searched.

## Live matches (rebuilt: live.js)
- Seed/fake jobs removed from results (old saved seeds are purged automatically).
- Real listings only: Jobicy (Japan + APAC remote jobs) and Remotive (Japan/Asia/worldwide), filtered per selected role. Each role gets its own results; role picker: All / role 1 / role 2…
- Relevance filter (title/description must match the role) — unrelated jobs are dropped.
- Refresh shows when it updated, how many listings, how many are NEW, per-source counts, and any source that failed. 15-min / 3-hr caching protects the free APIs.
- HTML/entities cleaned from titles & descriptions; "Real listing" badge + posted date.

## Open real listings now (per role)
- ⚡ LinkedIn Easy Apply, Indeed Japan, GaijinPot, CareerCross (+ Daijob, Wantedly, LinkedIn, Japan Dev, TokyoDev for tech roles) open live search results for your role — works for on-site Japan jobs in any field.

## Link-only sections
- Easy Apply / Agencies / SME tabs split into "🔎 Search with your role" and "🔗 Website links only / Register". Buttons now say Search / Register / Website.
- Japan Boards: JETRO and Skillhouse moved to link-only; the 27 company career pages (formerly fake "jobs") are now a "Company career pages (website links only)" section.

Files: new live.js; changed jobs.js, sources.js, storage.js, index.html, sw.js (cache fj-v7.5.0)
