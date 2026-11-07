# FindJob Now — Independent Product Audit (V3.2.0 → V3.3.0)

Scope: live site + source in the zip (single 2,646-line `index.html`, `sw.js`, manifest). I read the code; I did not run user tests, so usage claims below are judgement, not data.

## 1. Executive Summary
A well-meant, private, zero-signup PWA with a clear promise. The biggest problem: **the product helps people prepare to apply, but the job search itself does not return jobs in Japan.** Live search pulls from Remotive/Jobicy (overseas remote, English), plus Greenhouse/Lever/Ashby APIs. A foreigner in Japan who taps "Find jobs" gets mostly irrelevant roles. Everything else (ATS check, interview coach, tracker) is rule-based, so it is easy to copy and weak against Teal/Jobscan. As a startup today: a nice free tool, not yet investable. It becomes interesting only with (a) real Japan job supply, (b) real LLM features, (c) proof of repeat use.

## 2. UX findings
- **Confusion:** "Step 1 of 10" on landing vs "Step X of 5" in the header; "Step 3" label appears on both Dashboard and Jobs; Copilot card, readiness card, scores, goal buttons and role selector all compete on Home.
- **Decision fatigue:** Home showed ~6 cards and 5+ buttons, two separate "Find Jobs" CTAs, and a 10-line journey list before the user had done anything.
- **Unnecessary clicks:** Upload → Analysis → Goal choice → Jobs. The goal choice (3 buttons) adds a tap before value; default to "Fast" and let people change it later.
- **Weak-English users:** marketing words ("Copilot", "decision fatigue", "ATS", "Heuristic") and long English sentences. JP toggle exists but many strings are English-only (readiness card, tools).
- **Onboarding:** good that no sign-up is needed; bad that value (a score) arrives only after finding/preparing a CV. People with no CV have only a small text link.

## 3. Product-market fit
- Repeat use is plausible only around the **tracker + follow-up** loop. One-off tools (CV score) are used once.
- Highest value: CV ATS/Japan-fit fix, application score vs a job ad, Japan-style interview practice, follow-up reminders.
- Remove/hide: Premium Roadmap tool, Recruiter Matches (static list), industry percentage bars (false precision), the "Hiring probability" framing.

## 4. Conversion (reaching applications)
Drop-off points, in order: (1) CV upload friction (PDF parse failure, no CV at all), (2) goal screen, (3) job results that are not in Japan, (4) pasting a job ad manually to score it, (5) no reminder system, so users never return.

## 5. AI features
- **Real AI today: none.** All engines (analyse, ATS, scoreApp, rewriteBullet, coachAnswer, cover letter) are regex/keyword/heuristic.
- **Make LLM-powered first:** CV rewrite + Japan-format (履歴書/職務経歴書) conversion; cover letter per job; interview feedback; job-ad plain-English/Japanese translation and scam check. Needs a thin proxy (rate limit, no key in client).

## 6. Competitors (honest)
| Product | Their edge | FindJob Now's angle |
|---|---|---|
| Teal | Tracker, extension, AI resume | Japan context, no signup |
| Jobscan | Deep ATS match | Free, simpler (but shallower) |
| Huntr | Board + extension | Beginner language support |
| Careerflow | LinkedIn tools | Not LinkedIn-centric |
| Kickresume | Templates, AI writing | No Japan 履歴書 template yet |
| LinkedIn Premium | Network, InMail, supply | Cannot compete on supply |
Only defensible niche: **foreigners in Japan, low English, Japan-specific CV/visa/interview knowledge.** None of the above serve it.

## 7. Technical
- **Performance:** one 129 KB HTML file with inline JS/CSS; fine for now, hard to maintain. PDF.js loaded on demand (good).
- **PWA:** manifest + SW OK. Gaps: icons not maskable, no install prompt on Android, no offline job cache, pinch-zoom was disabled (fixed).
- **Security:** CSP present but allows `'unsafe-inline'` scripts; user text is escaped via `esc()` (good). Third-party favicon calls to Google leak the job domains viewed. Data lives in localStorage only: lost on cache clear, never synced (backup button mitigates).
- **Scalability:** no backend means no job index, no notifications, no analytics. Adding an LLM or job index requires a small serverless layer.

## 8. Top 10 Critical Problems
1. No jobs located in Japan in live search.
2. No real AI; claims of "AI" overstated.
3. Home screen overload / duplicate CTAs.
4. Inconsistent step counts (10 vs 5).
5. Heavy English jargon for the target user.
6. Readiness "probability" can mislead users.
7. No reason to return (no reminders/notifications).
8. Manual job-ad pasting to score jobs.
9. localStorage-only data, easy to lose.
10. Monolithic file, no tests, no analytics.

## 9. Top 10 Highest-ROI Improvements
1. Add a Japan job source (Hello Work / board deep-links with the user's role pre-filled).
2. Simplify Home to score + one action (done in V3.3.0).
3. Default the goal; remove the goal screen.
4. Plain-English / JP rewrite of every string.
5. LLM CV rewrite + 履歴書 export (PDF).
6. One-tap "score this job" straight from results (no pasting).
7. Follow-up reminders via calendar (.ics) export, no backend needed.
8. Honest labels on scores (done).
9. Privacy-friendly analytics (funnel: upload → job opened → applied).
10. Maskable icons + Android install prompt.

## 10. Features to remove / hide
Premium Roadmap, static Recruiter Matches, industry % bars, "Hiring probability" wording, Copilot funnel stats until the user has 1+ application.

## 11. Features to build next
Japan job feed; LLM CV/cover letter; 履歴書/職務経歴書 template export; job-ad translator + scam check; calendar follow-ups; visa checklist per status; email-forward import for applications.

## 12. Roadmap
**30 days:** finish simplification across Jobs/Toolkit screens; Japan job deep-links; plain-language JP/EN pass; add analytics; maskable icons.
**90 days:** serverless LLM proxy; CV rewrite and cover letter via LLM; 履歴書 PDF export; calendar reminders; user interviews with 20 real foreign job-seekers.
**6 months:** Japan job index (partnerships/feeds); recruiter marketplace or paid premium (CV + interview AI); optional accounts for sync; Android/iOS wrapper if retention proves out.

## VC verdict
Pass today, watch in 6 months. Real need and a clear niche, but no supply, no AI moat, no retention data. Evidence that would change my mind: 20%+ week-4 retention and measurable interview rates among users.

## What V3.3.0 already changed in the code
See PRODUCT_SPEC.md "V3.3.0 Simplification Release". Not changed (needs backend/data): real LLM, Japan job feed, analytics.
