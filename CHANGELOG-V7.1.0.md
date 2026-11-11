# FindJob Now V7.1.0 — Tokyo-centric & Foreigner-in-Japan

## Theme
Tokyo-first. Foreigner-friendly company database. Culture, visa, JLPT, Japanese resume tools. Still private, offline, rule-based.

## Critical additions
1. **FOREIGNER_FRIENDLY_COMPANIES** — 40 companies (Rakuten, Mercari, Google Japan, Amazon Japan, JTB, HIS, Hilton, Salesforce, etc.) with type, industry, Tokyo flag, visa note
2. **TOKYO_AREAS** — 16 key wards + 4 commutable cities (Yokohama, Kawasaki, Saitama, Chiba)
3. **SALARY_BENCHMARKS** — role-specific Tokyo ranges (entry / mid / senior in 万円)
4. **BUSINESS_CULTURE_TIPS** — 8 tips (報連相, 根回し, 名刺交換, punctuality, hierarchy, 和, 飲み会, apology)
5. **Location step** in wizard (6 steps total): Tokyo / Osaka / Nagoya / Fukuoka / Remote / Any
6. **Company directory** in Jobs tab — Foreigner-friendly vs Japanese tabs; add to targets
7. **New tools** (11 total): Culture, Visa deep-dive, Japanese resume guide, JLPT resources, Interview prep, Tokyo areas (+ existing ATS, rewrite, achievement, interview, salary)
8. **Target companies** tracker on dashboard
9. **Interview countdown** + follow-up email template in Tracker
10. **SW cache** bumped to `fj-v7.1.0`

## Files
- New: `japan-data.js` (all Japan-centric constants)
- Updated: storage.js, i18n.js, jobs.js, tools.js, tracker.js, app.js, index.html, sw.js, manifest.webmanifest
- Unchanged logic: dna-engine.js (still powers analysis & matching)

## Preserved
PWA · Offline · Local-only storage · EN/JP · No login · GitHub Pages compatible · No cloud AI

## Version
APP_VERSION 7.1.0 · DNA engine 7 · SW fj-v7.1.0
