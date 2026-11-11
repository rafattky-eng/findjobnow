# FindJob Now V6.0.0 — Career Target Intelligence Platform

## Summary
Transformed FindJobNow from a Resume Analysis tool into a **Career Target Intelligence Platform**.

The matching engine now combines:
1. Candidate Resume
2. Desired Job Industries
3. Desired Job Titles
4. Career Goals

## Key Changes

### Onboarding (major UX simplification)
- **Removed** 10-step multi-page onboarding
- **New 2-step flow**:
  1. Resume Upload (PDF / DOCX / TXT / Paste)
  2. **Single-page Career Target Profile** with 4 grouped sections:
     - A. Candidate Profile (experience, English, Japanese, other languages, location, visa)
     - B. Desired Job Industries (multi-select chips)
     - C. Desired Job Titles (tag input — Enter/comma to add)
     - D. Career Goal (textarea, max 1000 chars)
- User reaches results as quickly as possible
- Mobile-first, large touch targets, sticky action button

### Target Career DNA Engine (new)
- Generates Current Career Identity → Target Career Identity
- Skill / experience gaps
- Recommended progression path
- Role buckets: Immediate / Growth / Stretch / Avoid

### Matching Weights (updated)
- 30% Resume Experience
- 20% Skills
- 15% Career Goals
- 15% Desired Job Titles
- 10% Language
- 5% Visa
- 5% Location

### Navigation
- Removed Resume tab (resume is part of the Career Target flow / profile)
- Kept: Home · Jobs · Toolkit · Tracker

### Dashboard Redesign
- Compact score cards: Resume Score, Job Readiness, Target Match, Japan Fit
- Target Career DNA card (current → target, gaps, progression)
- Recommended Roles (Immediate / Growth / Stretch / Avoid)
- Advanced details behind "View Details"

### Data Model
```js
STATE.targetJobs = {
  industries: [],
  titles: [],
  careerGoal: ""
};
STATE.targetDNA = { ... }  // generated
```

### Versioning
- APP_VERSION = "6.0.0"
- DNA_ENGINE_VERSION = 6
- Service Worker cache: `fj-v6.0.0`
- Manifest version: 6.0.0

### Preserved
- Career DNA, ATS Optimizer, Application Score, Resume Rewriter
- Interview Coach, Tracker, Salary Estimator, Visa Assistant, Roadmap
- PWA, Service Worker, Offline support, Backup & Restore
- Local-only storage, no account required
- EN / JP bilingual UI
- Live job search integrations

## Files
- `index.html` — main app
- `sw.js` — cache `fj-v6.0.0`
- `manifest.webmanifest` — version 6.0.0
- Icons unchanged
