# FindJob Now V9.0.2

Real Japan job search + direct application assistant  
Progressive Web App · GitHub Pages · Free · Private · iPhone-friendly

**Live:** https://rafattky-eng.github.io/findjobnow/

## Goals of this build
- Prefer sites that accept **Easy Apply**, **resume upload**, or **email CV**.
- Show **real vacancies** from public employer feeds (Greenhouse + remote feeds filtered for Japan).
- Keep Japan board **search links** clearly separate from vacancy counts.
- Compact **cubic header** (EN / JP / Reset / Save).
- Full **EN ↔ JP** UI switch; bilingual application note.
- **Fewer files** in the ZIP (old changelogs removed).

## Deploy
1. Unzip this package.
2. Push contents to the GitHub Pages repo for the URL above.
3. On iPhone: open site → Share → Add to Home Screen. Hard-refresh once for the new service worker (`fj-v9.0.2`).

## Privacy
CV text and applications stay in the browser (localStorage). No account required.

## Honest limits
Static GitHub Pages cannot scrape protected boards, auto-submit external forms, or translate other websites inside their domains. Final apply is always done by you on the employer or board site.

Copyright © 2026 Rafat Kotaki. All rights reserved.
