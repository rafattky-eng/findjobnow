# FindJob Now V7.2.0 — Multi-role + Live matches + Full Japan boards

## Theme
Fix empty “No jobs yet” state. Multi-role selection after resume. Live matching jobs first. Complete English-language Japan job board list. Auto-suggest foreigner-friendly companies.

## Critical fixes & additions
1. **Multi-role selection** — Wizard step 1 now supports selecting one or more roles (chips + free text with comma separation). Stored in `desiredRoles[]` and `targetJobs.titles`.
2. **Live matches never empty** — `searchLiveJobs()` still queries Remotive + Jobicy, then always merges a curated set of 40 Japan-relevant seed jobs (JTB, HIS, Rakuten, Mercari, Google Japan, Hilton, Salesforce, Amazon Japan, etc.) scored against the user’s profile/roles. Result capped at ~45, sorted by match %.
3. **Full Japan Job Websites list** — All 14 English-language boards from the provided list (CareerCross, Daijob, GaijinPot, LinkedIn Japan, Indeed Japan, Robert Walters, Michael Page, JAC Recruitment, JETRO, TokyoDev, Japan Dev, Wantedly, Skillhouse, Japan Times Jobs) with deep-link search where possible.
4. **New “Japan Boards” tab** — Dedicated tab under Jobs so users can open any board with their role pre-filled and apply online immediately.
5. **Auto target companies** — After wizard completion, top foreigner-friendly companies (Rakuten, Mercari, Google Japan, Amazon Japan, Salesforce, Hilton, JTB, HIS, Microsoft, LINE) are automatically added to Target Companies on the dashboard (non-destructive, max ~6).
6. **Background search** — Wizard finish triggers `searchLiveJobs()` so the Matches tab is populated when the user opens Jobs.
7. **Copy / i18n** — Clearer empty state and role-pick messages in EN + JP.

## Files touched
- jobs.js (rewrite: boards, seed jobs, multi-role search, tabs, autoSuggest)
- app.js (multi-select role UI + wiring)
- dna-engine.js (finalizeWizard multi-role + auto targets + kick search)
- storage.js (APP_VERSION 7.2.0, desiredRoles migration)
- i18n.js (no_jobs / pick_role EN+JP)
- sw.js (cache fj-v7.2.0)
- index.html (footer version)

## Preserved
PWA · Offline · Local-only storage · EN/JP · No login · GitHub Pages compatible · No cloud AI · Rule-based matching

## Version
APP_VERSION 7.2.0 · DNA engine 7 · SW fj-v7.2.0
