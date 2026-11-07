# V4.0.0 — Career DNA Engine: Architecture, UI, Data Model, Plan

## 1. Architecture changes
Before: CV → keyword count → industry % → fixed title list → search by first word → same jobs.
After: CV text + Preference Profile → `computeDNA()` → roles/archetype/industries → role-based search plan → `matchJob()` per job → diversified, explained results.

| Piece | Function | Notes |
|---|---|---|
| Signal extraction | `extractSignals`, `extractTitles`, `estimateYears` | 16 domains, saturating score, past job titles outweigh keywords, years from date ranges |
| Preferences | `inferPrefs`, `PREF_LIKES`, `PREF_DISLIKES` | Explicit choices beat guessed ones; explicit dislikes cap a role's score |
| Role catalog | `ROLE_CATALOG` (24 roles) | Profile weights, level, minimum years, tags, search phrases, Japanese need |
| Engine | `computeDNA` | Archetype, candidate type, industries, expertise, best/avoid/fast/long roles |
| Job scoring | `matchJob` | 40/25/20/10/5, plus explanations and interview chance |
| Search | `searchLiveJobs` | Query per selected role, per-role quota, location-eligibility filter |
| Share | `nativeShare`, `shareApp`, `shareDNA`, `shareJob` | `navigator.share()`, `canShare()`, clipboard fallback |

## 2. Anti-misclassification rule
Hands-on coding is capped at 30 unless the CV shows an engineering title or building verbs. Software Engineer fit is cut when management + product + leadership outweigh coding. Test: a TPM CV with Python/SQL ranks Software Engineer 21st of 24; a real developer CV ranks it 1st.

## 3. Match formula (per job)
`total = 0.40·experience + 0.25·interest + 0.20·skill + 0.10·language + 0.05·visa`
- Experience: role-family fit (60%) + domain overlap with the ad (40%), reduced for seniority gaps and required years.
- Interest: tags of the job vs likes/dislikes (explicit dislike → capped at 30, soft/guessed dislike → mild penalty, remote/on-site preference).
- Skill: named tools/skills in the ad that the CV has (60%) + domain coverage (40%).
- Language: Japanese level required in the ad vs the CV (JLPT or "Japanese" mentioned).
- Visa/location: "US only" / "must be authorised to work in…" → heavy penalty and cap at 45; visa-support jobs score highest.
- Interview chance = total × 0.88 − penalties (missing years, Japanese gap, location) → High ≥ 62, Medium ≥ 38, else Low. It is a rough guide, not a prediction.

## 4. UI changes
- Dashboard: Career DNA card (archetype, candidate type, best/avoid roles, share) → collapsible preference tuner → one next action → readiness → full analysis.
- Full analysis: experience meters (management, leadership, operations, marketing, product, technology, travel), fast-hire, long-term and avoid role lists.
- Role selector: fit %, ⚡ fast-hire and 🌱 long-term badges, plain reason per role.
- Job cards: match %, interview chance, “Why this score?” (5 bars, why it matches, why not, missing requirements), 📤 share.
- Header: 📤 share app. Details panels remember if they were open.

## 5. Data model
New in `STATE` (localStorage `fj2_state`):
- `prefProfile`: `{ likes[], dislikes[], style:{remote}, path, note }`
- `dna`: `{ version, yrs, level, titles[], signals{}, evidence{}, prefs, likesInferred[], dislikesInferred[], archetype, secondary, candidateType, industries[], expertise[], roles[], best[], avoid[], fast[], long[], ja, jlpt, visaStatus, skillTerms[] }`
- `matches.titles[]` gains `id, titleJp, fit, fast, long`.
- Jobs gain `_role`, `matchScore`, `fastHire` (match details are recomputed at render, so EN/JP switching works).
Migration: on load, any saved profile without `dna` (or version < 4) is rebuilt from the saved CV text. Backups are unchanged and still restore.

## 6. New fields (summary)
`prefProfile.*`, `dna.*`, `matches.titles[].fit/fast/long/id/titleJp`, `jobs[]._role/matchScore/fastHire`.

## 7. Implementation plan
Done in V4.0.0: engine, preference UI, scoring, explanations, role-based search, share, migration, browser test (CV paste → DNA → preferences → jobs → share → reload).
Next (30 days): tune role catalog with real user CVs; add a Japan-located job source so results are not only remote; add 20 sample CVs as automated tests.
Later (90 days): optional LLM pass for CV reading and reasons (needs a small server); ask users “was this job relevant?” to tune weights; Japanese résumé (履歴書) export.

## 8. Limits to know
- Still rule-based, not an LLM: unusual wording or non-English CVs may be misread.
- Remote job feeds are mostly overseas; location filters help but cannot create Japan jobs.
- Interview chance and match % are estimates from text, not outcomes.
- iPhone share needs HTTPS (GitHub Pages is fine) and a tap; Safari shows the native sheet.
