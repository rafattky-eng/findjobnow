# FindJob Now V9.0.3

Real Japan job search + direct application assistant  
Progressive Web App · GitHub Pages · Free · Private · iPhone-friendly

**Live:** https://rafattky-eng.github.io/findjobnow/

## What’s in this package (minimal files)
| File | Purpose |
|------|---------|
| `index.html` | App shell |
| `app.js` | All application logic (single bundle) |
| `styles.css` | UI |
| `sw.js` | Service worker |
| `manifest.webmanifest` | PWA manifest |
| Icons | favicon, apple-touch, 192, 512, maskable |
| `README.md` | This file |

## V9.0.3 notes
- **Fewer files**: all JS modules merged into one `app.js` (was 11 separate scripts).
- Easy Apply / resume-upload boards expanded.
- Header controls in compact 2×2 cube (EN · JP · Reset · Save).
- Steps focused on CV → roles → real search → apply with note → track.
- Bilingual application note (EN + JP).
- Real vacancies from Greenhouse + Jobicy + Remotive (Japan-filtered); Japan boards as search links only.

## Deploy
1. Unzip.
2. Push all files to the GitHub Pages repo.
3. On iPhone: open site → Share → Add to Home Screen. Hard-refresh once (`fj-v9.0.3`).

## Privacy
CV and applications stay in the browser (localStorage). No account.

## Limits (honest)
Static GitHub Pages cannot scrape protected boards, auto-submit external forms, or translate other sites inside their domains. You complete the final apply on the employer/board site.

Copyright © 2026 Rafat Kotaki. All rights reserved.
