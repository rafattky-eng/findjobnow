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
