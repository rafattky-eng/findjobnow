# FindJob Now V9.0.0 — Changelog

## Focus of this release

Move from a primarily directory / career-intelligence experience toward a **real vacancy search + direct-application assistant** for Japan, within the hard limits of a free static GitHub Pages PWA (no paid APIs, no always-on backend, CORS constraints).

## What changed

### Real vacancy feeds
- Added **Greenhouse public job boards** for a curated set of companies (Airbnb, Stripe, Figma, Dropbox, GitLab, Intercom, Asana, Remote.com, Tripadvisor and similar).
- Japan / Tokyo location filter applied to Greenhouse results so only relevant vacancies appear.
- Existing Jobicy (APAC + Anywhere) and Remotive remote feeds retained and still filtered for Japan-eligible locations.
- Clear UI distinction between **verified vacancies from employer feeds** and **Japan job-board search links** (the latter are never counted as vacancies).

### Multi-role search
- Expanded recommended job-title list to the V9 priority set (Business Development, Inbound Tourism, International Sales, Partnerships, Operations, etc.).
- Added **Select All** and **Clear** controls for role chips.
- Search still runs across all selected roles in one session; duplicate vacancies across sources are deduplicated.

### Application helpers
- Existing direct-email preparation, application note generator, and tracker retained.
- Messaging updated to prioritise: Direct CV upload → Direct email → Genuine Easy Apply → Recruiter submission → forms requiring extra registration.
- Honest labelling: application method is never claimed as verified unless the source provides it.

### UX / iPhone
- Version label, service-worker cache, and manifest updated to V9.0.0.
- Hero and honesty copy rewritten to state the real goal: find employers, match CV, apply with fewer steps.
- Select-all / clear controls improve the multi-title workflow on small screens.

### Privacy & constraints (unchanged principles)
- CV and application data stay in localStorage on the device.
- No paid APIs, no required sign-up, no backend subscription.
- Static GitHub Pages cannot bypass CORS or scrape protected job boards; limitations are shown in the UI and this changelog.

## What is still not possible on pure GitHub Pages
- Full scraping or live search of CareerCross, Daijob, GaijinPot, Wantedly, Indeed Japan, LinkedIn, etc. (ToS + CORS).
- Automatic translation of arbitrary third-party vacancy pages inside their domains.
- Guaranteed “Easy Apply” or CV-upload detection on every external form.
- Cloudflare Worker proxy is not bundled; if one is later deployed by the owner it can be pointed at from the same origin.

## Upgrade notes
- Existing local state (CV text, preferred roles, application tracker) is preserved via the same storage key.
- Users should hard-refresh or reinstall the PWA so the new service worker (fj-v9.0.0) activates.

Copyright © 2026 Rafat Kotaki. All rights reserved.
