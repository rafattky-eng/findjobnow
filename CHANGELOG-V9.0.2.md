# FindJob Now V9.0.2

## Focus
Make Easy Apply / resume-upload paths more visible, tighten the apply workflow, improve the iPhone header controls, and reduce the number of files in the ZIP.

## Changes

### 1. Easy Apply & resume-upload sites (expanded)
- Expanded the dedicated Easy Apply / resume-upload list with more Japan-relevant boards that commonly support:
  - LinkedIn Easy Apply
  - Indeed Japan (Indeed Apply / CV upload)
  - CareerCross, Daijob (profile + resume)
  - GaijinPot, Jobs in Japan, WeXpats
  - Green, Wantedly, TokyoDev, Japan Dev, WORK JAPAN
  - Careerjet, Glassdoor-style apply, recruiter CV submission paths
- Clear tags: `easy`, `upload`, `foreign`, `bilingual`, `sme`
- Honest notes per site (what is one-click vs profile upload vs recruiter).

### 2. Header controls — cubic layout
- EN / JP / Reset / Save are now in a compact **2×2 cube** on the top-right (stacked, not a long horizontal row).
- Better use of limited iPhone header space; still large enough for touch.

### 3. Steps focused on real jobs + apply
- Daily plan / strategy steps rewritten to:
  1. Upload or paste CV once
  2. Select roles (including Select All)
  3. Search employer feeds + open resume-upload / Easy Apply boards
  4. Apply with the application note (email or upload)
  5. Track and follow up

### 4. Application note
- Stronger bilingual application email templates (EN + JP) that mention the attached resume and invite interview.

### 5. Translation
- UI continues to switch fully with EN / JP.
- Application note and strategy steps are fully bilingual.
- Feed vacancy language is indicated; external translate option remains for third-party pages (GitHub Pages cannot translate inside other domains).

### 6. Fewer files in the ZIP
- Removed all old V7 and intermediate V9.0.0 changelogs and test reports.
- ZIP now contains only current source + one CHANGELOG, one TEST-REPORT, README, and assets.

### 7. Version
- `9.0.2` / service worker `fj-v9.0.2`
- Local storage key unchanged (profile, applications, CV text preserved).

## Still limited by static GitHub Pages
- Cannot scrape protected Japan boards or guarantee every “Easy Apply” button is one-click.
- User must complete the final submit on the employer / board site.
- No invented vacancies or contacts.
