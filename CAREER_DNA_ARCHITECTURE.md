# FindJob Now V3.4 — Career DNA Engine Architecture

## Problem (V3.3.x)
- Matching is keyword-driven (`SKILL_PACKS` + `TITLE_HINTS`).
- Same ~40 jobs appear regardless of selected roles.
- System sees skills but ignores preferences, dislikes, work style, and career direction.
- Programming keywords force "Software Engineer" even when the CV shows Product / Project / Operations / Travel management.

## Goals Delivered
1. **Career DNA Engine** — analyses experience, skills, industries, languages, visa, interests, desired path, work style, dislikes.
2. **Preference Profile** — explicit likes / dislikes / work style / career path.
3. **Generated outputs** — Candidate Type, Career Archetype, Best Industries, Best Roles, Avoid Roles, Fast-Hire Roles, Long-Term Career Roles.
4. **Smarter resume analysis** — management, leadership, operations, marketing, product ownership, travel expertise; role labels such as Technical Project Manager, Product Manager, Travel Product Manager, Operations Manager, Business Development Manager.
5. **Weighted job scoring** — 40% experience · 25% interest · 20% skill · 10% language · 5% visa + explanations (why match / why not / missing / interview likelihood).
6. **Native iOS share** — `navigator.share()` on job cards and application packs.

---

## Architecture Changes

### 1. Data Model (STATE additions)

```js
STATE = {
  // existing…
  profile: null,          // enriched by analyse()
  scores: null,
  matches: null,          // now includes careerDNA outputs
  preferences: {
    visaOnly: false,
    workType: "any",
    jlptMin: "",
    englishOnly: false,
    remoteOnly: false,
    experienceLevel: null,
    // NEW Preference Profile
    likes: [],            // e.g. ["Product creation","Management","Travel"]
    dislikes: [],         // e.g. ["Pure coding","Call center work"]
    workStyle: "",        // "collaborative" | "independent" | "hybrid" | "client-facing" | …
    careerPath: "",       // free text or selected archetype
    interests: []
  },
  careerDNA: null,        // full DNA snapshot (persisted after analysis)
  // …
}
```

### 2. New / Redesigned Functions

| Function | Responsibility |
|----------|----------------|
| `analyse(text)` | Enhanced extraction: management signals, leadership, product ownership, operations, marketing, travel expertise. Avoids pure SE classification when leadership/product language is stronger. |
| `buildPreferenceProfile(profile, userPrefs)` | Merges CV signals + explicit user likes/dislikes/work-style. |
| `buildCareerDNA(ana, prefs)` | Produces Candidate Type, Archetype, Best/Avoid/Fast/Long-term roles, industries. |
| `scoreJobMatch(job, profile, dna, prefs)` | Weighted score (40/25/20/10/5) + whyMatch[], whyNot[], missing[], interviewLikelihood. |
| `scoreLiveJob(...)` | Thin wrapper that now calls `scoreJobMatch`. |
| `shareNative(data)` | Uses `navigator.share` when available (iPhone/iPad/Safari), falls back to clipboard. |

### 3. Resume Analysis Heuristics (key rules)

- **Management / Leadership** signals: managed, led, team of, supervised, directed, head of, people manager, stakeholder, roadmap, OKR, P&L.
- **Product ownership**: product manager, product owner, roadmap, backlog, prioritisation, user stories, MVP, discovery.
- **Operations**: operations manager, process improvement, SOPs, logistics, supply chain, vendor management.
- **Travel industry expertise**: tour, itinerary, reservation, hospitality, hotel, guest relations, airline, destination, DMC.
- **Role classification priority** (highest first):
  1. Travel Product Manager / Tourism Product Owner
  2. Product Manager / Technical Product Manager
  3. Technical Project Manager / Project Manager
  4. Operations Manager / Business Development Manager
  5. Marketing / Customer Success / Sales
  6. Software Engineer only when pure engineering keywords dominate and no management/product language is present.

### 4. Career Archetypes (examples)

- Travel Product Builder
- Hospitality Operator
- Customer Experience Leader
- Business Development Hunter
- Technical Project Leader
- Product-Oriented Manager
- Career Starter (low experience)
- Hybrid Bilingual Professional

### 5. Job Match Weights

```
overall =
  0.40 * experienceFit +
  0.25 * interestFit  +
  0.20 * skillFit     +
  0.10 * languageFit  +
  0.05 * visaFit
```

Each component returns 0–100 and a short reason list. Interview likelihood is derived from overall + visa + language.

### 6. UI Changes

- **Dashboard**: new “Career DNA” card (Candidate Type, Archetype, Best Roles, Avoid Roles, Fast-Hire vs Long-Term).
- **Preference editor**: likes / dislikes chips + work-style selector (shown under full analysis or as a dedicated step).
- **Job cards**: expanded match breakdown (“Why this matches”, “Why it may not”, “Missing requirements”, “Interview likelihood”).
- **Native Share button**: appears on job cards and on generated application packs (iOS Share Sheet).

### 7. Implementation Plan (ship order)

1. Data model + `buildCareerDNA` + enhanced `analyse` (this release).
2. Replace `scoreLiveJob` / job-card rendering with weighted `scoreJobMatch` + explanations.
3. Preference Profile UI (likes/dislikes chips) and persist into STATE.
4. Dashboard Career DNA card + role selector driven by DNA (not only keyword titles).
5. `navigator.share` on job cards and letter/application pack.
6. (Follow-up) Japan job-board deep links pre-filled with DNA best roles.
7. (Follow-up) Optional lightweight LLM proxy for richer preference inference.

### 8. Backward Compatibility

- Existing localStorage profiles continue to work.
- On next analysis the new fields are populated.
- Old `matches.titles` still rendered; DNA titles take precedence when present.

### 9. Version

- **V3.4.0 Career DNA** — service-worker cache key should be bumped to `fj-v3.4.0`.

---

## File Changes Summary

| File | Change |
|------|--------|
| `index.html` | Enhanced analyse, new DNA engine, weighted scoring, preference UI hooks, native share, dashboard DNA card |
| `sw.js` | Cache version → `fj-v3.4.0` |
| `PRODUCT_SPEC.md` | Updated for Career DNA journey |
| `CAREER_DNA_ARCHITECTURE.md` | This document |

No backend required. All logic remains client-side and private.
