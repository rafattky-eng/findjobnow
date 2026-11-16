# FindJob Now V9.0.0

**Real Japan job search + direct application assistant**  
Progressive Web App · GitHub Pages · Free · Private · iPhone-friendly

Live site: https://rafattky-eng.github.io/findjobnow/

---

## What this version does

1. Lets you upload (or paste) a CV and extract key information locally.
2. Lets you select one or many target roles (including Select All).
3. Searches **public employer feeds** that can be called from the browser:
   - Greenhouse boards (selected companies with Japan/Tokyo locations)
   - Jobicy (APAC / Anywhere remote)
   - Remotive (remote)
4. Shows **verified vacancy cards** only for results that actually came back from those feeds.
5. Provides **Japan job-board search links** (CareerCross, Daijob, GaijinPot, Indeed Japan, LinkedIn Easy Apply filter, TokyoDev, etc.) clearly labelled as search shortcuts — never counted as vacancies.
6. Helps prepare application emails and tracks applications on the device.
7. Works fully offline after first load (service worker) for previously cached content; live search needs network.

## What it deliberately does not do

- It does **not** invent vacancies, emails, or salaries.
- It does **not** scrape sites that block CORS or forbid scraping.
- It does **not** claim every “Easy Apply” or CV-upload form is verified without the user checking the employer page.
- It does **not** require sign-up, paid APIs, or a backend subscription.

## Deploy (GitHub Pages)

1. Unzip `FindJobNow-V9.0.0.zip`.
2. Push the contents to the root (or `/docs`) of the repository that serves  
   https://rafattky-eng.github.io/findjobnow/
3. Wait for GitHub Pages to rebuild (usually 1–2 minutes).
4. On iPhone: open the site → Share → Add to Home Screen.
5. Hard-refresh once so the new service worker (`fj-v9.0.0`) activates.

No build step. No Node required. Pure static files.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Shell + CSP |
| `app.js` | Main UI & onboarding |
| `live.js` | Live vacancy search (Greenhouse + Jobicy + Remotive) |
| `jobs.js` | Job cards, filters, enrichment |
| `sources.js` | Japan board links, daily plan, notes |
| `dna-engine.js` | CV signal extraction & matching |
| `storage.js` | localStorage state |
| `i18n.js` | English / Japanese strings |
| `tracker.js` | Application tracker |
| `tools.js` | Extra tools |
| `boost.js` | Helpers |
| `japan-data.js` | Companies, locations, benchmarks |
| `styles.css` | iPhone-first design system |
| `sw.js` | Service worker (cache version V9.0.0) |
| `manifest.webmanifest` | PWA manifest |
| Icons | 192 / 512 / maskable / apple-touch / favicon |

## Privacy

- CV text and application history stay in the browser’s localStorage.
- No account, no server-side storage of personal data.
- You can clear data from the app or by clearing site data in Safari settings.

## Limitations (honest)

A static GitHub Pages site cannot:
- Call most Japan job-board private APIs.
- Bypass CORS.
- Translate arbitrary third-party pages inside their own domains.
- Confirm that an external “Apply” button is genuine Easy Apply or has a CV upload field without the user opening it.

Where a limitation exists, the UI explains it instead of inventing results.

## Licence & copyright

Copyright © 2026 Rafat Kotaki. All rights reserved.  
For personal use and deployment to the existing FindJob Now GitHub Pages site.
