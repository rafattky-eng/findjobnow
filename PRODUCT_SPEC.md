# FindJob Now V3.2 — Hiring Copilot

## Core Principle
Every screen has **only ONE primary next action**.  
Users (especially foreigners with weak English / no experience) never wonder what to do next.

## Guided 10-Step Hiring Journey

| Step | Screen | One Primary CTA | Finger guidance |
|------|--------|-----------------|-----------------|
| 1 | Upload CV | Upload / Paste | 👇 First: Upload your CV |
| 2 | AI Analysis | Review scores → Choose Goal | 👇 Review scores, then tap the big button |
| 3 | Choose Goal | Need a Job Fast / Career / Part-time | 👇 Choose one goal only |
| 4 | Find Jobs | Search realistic jobs | 👇 Find jobs that fit you today |
| 5 | Job Score | Score this job before applying | 👇 See if this job is worth applying |
| 6 | Generate Application | Create letter + ATS tips | 👇 Generate your application pack |
| 7 | Interview Prep | Practise Japan-style questions | 👇 Practise before the interview |
| 8 | Tracker | Move cards | 👇 Track every application |
| 9 | Follow-Up | Send follow-up after 7 days | 👇 Follow up if no reply |
| 10 | Offer Prep | Success dashboard | 👇 Prepare for offer & visa |

## Special Modes
- **Need a Job Fast**: Prioritizes realistic, apply-today jobs (part-time, hourly, visa-sponsored, entry-level).
- **What Jobs Can I Realistically Get Today?**: Ranking engine based on visa, language, experience, and board success rates.

## Design Rules Applied
1. One primary CTA per screen
2. 👇 finger guidance on every step
3. No decision fatigue
4. Clear next action always visible
5. Simple language for weak English
6. Entry-level & no-experience paths
7. Supports part-time / hourly / full-time / visa sponsorship

## Version
V3.1.0 Guided — builds on V3.0.0 engines (ATS, Interview Coach, Rewriter, Application Score, Recruiter Match).


## V3.2.0 Implementation Notes
- Added a transparent CV-based Hiring Readiness Estimate with reasons, blockers and one suggested improvement.
- The estimate is a heuristic readiness indicator, not a real-world hiring probability or guarantee.
- PDF.js loads on demand; unreadable PDFs open the existing Paste CV modal with a clear fallback message.
- Fast Job Mode adds part-time, hourly, entry-level, no-experience, Japanese-language and visa-support search terms, then floats relevant roles to the top without removing results.
- Saved applications retain the save date (`moved` and `createdAt`) for follow-up timing.
- Application Score displays scam-check reasons and pre-application fixes as separate bullet lists.
- Landing page keeps Upload CV as the primary action and makes browsing without a CV a small secondary text link.

## V3.3.0 Simplification Release
- Landing: plainer English hero, 3-line "how it works" (was a 10-line list), step counter unified to "of 5", backup-restore hidden behind a small link.
- Dashboard: readiness score and ONE next action are now first; full analysis, strengths, industries and secondary links are collapsed under "See full analysis". Duplicate "Find Jobs" buttons removed.
- Jobs: honest note that live results are overseas/remote roles, with a prominent "Open Japan job sites" button.
- Score renamed "CV Readiness Score" with plain wording (it is a heuristic, not a hiring probability).
- Accessibility: pinch-zoom re-enabled, visible keyboard focus, reduced-motion support.
- Footer repeated only once. Service-worker cache bumped to fj-v3.3.0.

## V3.3.1 Navigation + Motion
- Header back arrow (←) appears on every screen after the CV is loaded; it follows the real screen history.
- 🔄 Restart button in the header clears the profile, goal and job results (tracker is kept) after a confirmation.
- 👇 finger now taps up and down; the main button has a soft gold pulse. Both stop when the device asks for reduced motion.

## V3.4.0 Career DNA Engine
- Matching engine redesigned: Career DNA analyses experience, skills, industries, languages, visa, interests, work style, and dislikes.
- Preference Profile: likes / dislikes chips (Product creation, Management, Travel, Pure coding, Call center, etc.).
- Outputs: Candidate Type, Career Archetype, Best Industries, Best Roles, Avoid Roles, Fast-Hire Roles, Long-Term Career Roles.
- Resume analysis no longer forces Software Engineer when management / product / travel language is stronger. Recognises Technical Project Manager, Product Manager, Travel Product Manager, Operations Manager, Business Development Manager.
- Job scoring weights: 40% experience · 25% interest · 20% skill · 10% language · 5% visa. Each job shows why it matches, why it may not, missing requirements, and interview likelihood.
- Native iPhone share via `navigator.share()` on every job card (clipboard fallback).
- Dashboard Career DNA card with live preference editor and "Rebuild DNA".
- Service worker cache: `fj-v3.4.0`.
