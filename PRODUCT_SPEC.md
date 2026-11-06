# FindJob Now V3 — AI Job Search Copilot for Japan

## 1. Vision
Not "analyze my resume" but **"get me hired in Japan."** Success metric: **interview rate per application** (shown in-app as "Response %"), then offers. Loop: **Fix → Target → Apply → Interview → Follow up.**

## 2. Homepage value proposition
"Don't just analyze your resume. Get hired in Japan." Fix your CV for ATS, score every job before applying, practise interviews, follow up. Free, private, no signup. CTA: choose path (Experienced / New) → upload CV.

## 3. Experienced professionals
Achievement quantifier, ATS keyword match per job, recruiter/agency matching (Robert Walters, Michael Page, JAC), salary band + negotiation, Highly Skilled Professional points check *(planned)*, leadership interview set.

## 4. No experience
Transferable-skill builder (part-time, study abroad, club, project, language → CV bullets), entry-friendly role list, 90-day plan, JLPT target, visa-path warning (degree requirement), entry interview set.

## 5–9. Core engines (all eight fields)

| | 5 ATS Optimizer | 6 Interview Coach | 7 Resume Rewriter | 8 Application Score | 9 Recruiter Match |
|---|---|---|---|---|---|
| **Problem** | CV rejected by filters, no feedback | Unprepared for Japan-specific questions (志望動機, 逆質問, visa) | Duty lists, no numbers | Time wasted on poor-fit or scam jobs | Don't know which agencies take foreigners at their level |
| **AI solution** | Keyword gap + 8 format checks | Question bank by track; answer scoring (length, numbers, action→result, Japan link, fillers) | Weak-verb fix, metric placeholders, STAR/CAR variants, EN+JP summary | Weighted score: skills 35, language 25, experience 20, visa 20; scam penalty; verdict apply / tailor / stretch / skip | Rank by industry, years, JLPT; intro-message generator |
| **UX flow** | Paste JD → score → missing keywords → edit CV | Question → type answer → checklist → next | Paste bullet → 3 versions → fill [metrics] | Paste JD (or "Score" on a job card) → verdict → fixes → save to tracker | Open tool → ranked agencies → copy message → open site |
| **Data** | cvText, JD text | track, answers{} | bullet, profile | cvText, JD, profile (jlpt, yrs, visa) | profile, industries, agency tags |
| **Front-end** | textarea, score cards, chips, checklist | question card, coach checklist | input, letter-box | verdict, meters, fix list | ranked cards, copy button |
| **DB (server phase)** | `cv(id,user_id,text,parsed_json)`, `ats_run(id,cv_id,job_id,score,missing[])` | `iv_question(id,track,text,tip)`, `iv_answer(id,user_id,q_id,text,score,created)` | `rewrite(id,user_id,input,outputs[],accepted)` | `job(id,source,url,text,scam_flag)`, `app_score(id,user_id,job_id,parts_json,verdict)` | `agency(id,name,url,min_yrs,min_jlpt,industries[])`, `rec(id,user_id,agency_id,score)` |
| **API** | `POST /ats/check` | `GET /interview/questions`, `POST /interview/coach` | `POST /resume/rewrite` | `POST /jobs/score` | `GET /recruiters/match` |
| **Priority** | P0 (done) | P0 (done) | P0 (done) | P0 (done) | P1 (done, static data) |

V3 runs 100% in the browser (heuristics, localStorage). Server phase swaps heuristics for an LLM behind the same endpoints; add `user`, `application(id,user_id,job_id,stage,moved_at,score)`, `event(type,payload)` tables.

## 10. Premium roadmap
- **Free:** everything in V3.
- **Pro:** LLM rewriting; auto-tailored CV per job; voice mock interviews; live Japan job feeds; follow-up reminders; HSP points calculator.
- **Teams/Partners:** verified employers; visa document checklist with professional review; coach marketplace; outcome analytics (response rate by CV version).

## Success loop (hiring rate)
Score ≥70 → apply; 50–69 → tailor first; <50 → referral only; applied 7+ days → follow-up prompt; interview stage → practice prompt.
