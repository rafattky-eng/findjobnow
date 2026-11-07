# FindJob Now V3.2.0 — patch notes (built on your V3.1.0 Guided zip)

Nothing was removed. All changes are in `index.html` (+ cache version in `sw.js`). Block of new code starts at `// ===== V3.2 ...` just above `function setView`.

## Technical fixes
| # | What | Functions | Why |
|---|---|---|---|
| 1 | Robust PDF loading | **new** `ensurePdfJs()`, `showPdfFail()`; **replaced** `extractPdfText()`; `wireLanding()` upload handler; old loader `<script>` block replaced by a warm-up call | Waits for PDF.js (15 s timeout, retry on failure), 10 pages, line-aware text, empty-text detection. On failure shows "We couldn't read your PDF. Please paste the text instead." + **Paste CV** button that opens the existing `pasteModal`. |
| 2 | Fast Job Mode | **new** `fastRank()`, `FAST_KW`; `renderJobs()` | If `STATE.journey.fastMode`: keep only matches (part-time, hourly, entry level, no experience, 未経験, アルバイト, visa sponsorship) when ≥3 exist; otherwise keep all jobs, fast-hire first. Banner shown. |
| 3 | Tracker | **new** `dSince()`, `dueFollowUps()`; `renderCopilot()`, `renderTracker()` badge; migration adds `moved` to old items | `moved: today()` was already set on save; reminders now count from the save date for Saved **and** Applied. |
| 4 | Application Score | Score tool output | "What to fix before applying" (`r.fix`) and "Scam check details" (`r.sc.reasons`) are now clear bullet lists with an all-clear line. |
| 5 | Landing | `renderLanding()`, `wireLanding()` | One primary button (Upload CV). Paste is a small ghost button; "Just browsing? See jobs without a CV →" is a text link below the guide and opens Jobs. |

## New features
| Priority | Function(s) | Where |
|---|---|---|
| 1 Hiring Probability Engine | `hiringModel()`, `renderHiring()` | Top of dashboard. 8 weighted factors → %, ✅/⚠ list, blockers, fastest improvements. |
| 2 Realistic Jobs | `realisticJobs()`, `renderRealJobs()` | "Jobs You Can Realistically Get This Week" with % per role (seniority penalty, goal bonus). |
| 3 AI Hiring Coach | inside `renderHiring()` | Exactly ONE "👇 Next Best Action" with before/after %. Button opens the right tool. |
| 4 Daily Dashboard | `renderDaily()` | Readiness current vs 80% target; 5 daily tasks (auto-tick where measurable). Resets each day. |
| 5 Career Simulator | `renderSim()` | Today → +CV fixes → +JLPT N3 → +6 months experience (cumulative). |
| 6 Recruiter Intelligence | `NEW_TOOLS.recruiters` (replaced) | Match %, why-matched bullets, recommended action; intro message kept. |
| 7 Funnel | unchanged | Your 10-step guide already matched; every step keeps 👇 + one primary CTA. |

## Free / Pro
Local flag `STATE.plan` (`isPro()`). **Free:** CV analysis, job search, tracker, recruiter matching, probability %, realistic jobs, next best action. **Pro (locked):** blockers + fastest improvements, Career Simulator, Daily Dashboard, recruiter recommended action. Lock cards say "Free during beta — no payment yet"; **Unlock Pro preview** sets the flag. No payment is wired in. Not implemented: ATS scoring limit and Smart Follow-Up Reminders as paid features (ATS stays unlimited; follow-up reminders use the existing 7-day logic).

## Notes
Probabilities are heuristic estimates from CV text, not employer data. Weights live in `hiringModel()` (`w` per factor) — tune them there.
