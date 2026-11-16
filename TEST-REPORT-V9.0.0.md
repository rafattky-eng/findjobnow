# FindJob Now V9.0.0 — Test Report

## Scope
Static checks and source-level verification performed on the V9.0.0 build derived from V7.6.0. Live API responses and full iPhone Safari interaction must be re-checked after deployment by the owner.

## Performed

### Structure & version
- [x] APP_VERSION = "9.0.0" in storage.js
- [x] Service worker cache name fj-v9.0.0
- [x] manifest.webmanifest version 9.0.0
- [x] Footer and index version labels updated
- [x] CHANGELOG-V9.0.0.md and this report present

### Job search engine
- [x] Greenhouse boards added (airbnb, stripe, figma, dropbox, gitlab, intercom, asana, remotecom, tripadvisor)
- [x] Greenhouse results filtered to Japan / Tokyo / related locations
- [x] Jobicy APAC + Anywhere + Remotive retained with Japan-scope filter
- [x] Deduplication by URL / title+company+location
- [x] Source status (ok / cached / error / count) still collected
- [x] Zero-result messaging distinguishes feed failures from “no match”
- [x] Japan board search links remain clearly labelled and not counted as vacancies

### Multi-title
- [x] ROLE_SUGGESTIONS expanded to V9 priority list
- [x] Select All / Clear buttons added and wired
- [x] Multi-role selection still drives a single search session

### CV & matching
- [x] Existing PDF.js extraction path retained
- [x] Existing DNA / scoring engine retained
- [x] Local storage of profile and applications preserved

### Application helpers
- [x] Application note / email generator retained
- [x] Tracker (saved / applied / interview / offer / rejected) retained
- [x] Opening a board link does not auto-mark “applied”

### Language & iPhone
- [x] EN / JP language switch retained
- [x] iPhone-oriented viewport, safe-area, and bottom nav structure retained
- [x] PWA icons and apple-touch-icon retained

## Not verified in this environment
- Live Greenhouse / Jobicy / Remotive response bodies and CORS behaviour on every network.
- Actual number of Japan vacancies returned on any given day (varies).
- Full iPhone Safari + Home Screen PWA install/update cycle.
- Real CV upload → employer form submission (requires live employer systems and user action).
- Japanese translation quality of third-party vacancy text (browser / external tools only).

## Known remaining limitations (by design of static GitHub Pages)
- No scraping of Japan recruitment sites that block CORS or forbid it in ToS.
- No automatic “this form has a CV upload field” detection on external domains.
- No Cloudflare Worker proxy is shipped; owner can add one later if desired.
- Visa sponsorship and language requirements are only shown when the source provides them; never invented.

## Acceptance statement
V9.0.0 improves the real-vacancy path by adding public Greenhouse employer boards with Japan filters, expands multi-role selection, and clarifies the difference between verified feed vacancies and search links. It does not claim to retrieve every Japan vacancy or to automate every application method. The ZIP is complete and deployable to the existing GitHub Pages URL.

Do not treat this report as a claim that every acceptance test in the V9 master instructions was executed end-to-end against live employer systems.
