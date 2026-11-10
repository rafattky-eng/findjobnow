# FindJob Now V5.0.1 / V5.1 CHANGELOG

## Files
- `index.html` — main app (~3700 lines)
- `sw.js` — cache `fj-v5.0.0`
- `manifest.webmanifest` — version 5.0.0

## Version
- `APP_VERSION = "5.0.0"`
- Footer: `© 2026 Rafat Kotaki. All rights reserved.` / `FindJobNow · V5.0.1`
- Service worker: `const V = "fj-v5.0.0"` (old fj-v4.* deleted on activate)

## Hard requirements completed
1. **Honesty** — Removed all "Hiring Copilot". AI claims → "Smart (rule-based) matching — no cloud AI, no sign-up." Meta + hero + honesty footer line updated.
2. **One-tap iOS share** — `navigator.share` called synchronously inside the click handler (no await before the call). Clipboard fallback silent.
3. **Visible selection** — `.sel` CSS + existing `.on` / `aria-pressed` on onboarding controls, role chips, preference chips, work-type multi-select.
4. **Tools independent** — Toolkit tab remains; Interview removed from bottom nav (lives only as a toolkit card). Deep link `?tool=ats` opens toolkit with that tool expanded. Opening tools does not clear jobs/DNA/roles.
5. **10-step ordered gate** — Full onboarding module:
   - Steps 1–10 with progress checkboxes (✅ / 👇 / ⬜)
   - Locked until previous complete (step 1 & 2 always reachable; 8–10 skippable with defaults)
   - STATE.onboarding persisted; resume mid-flow on reload
   - Experience, work type (multi), English 1–5, Japanese 1–5, other language, location, visa (+ sub-status), nationality, likes/career story
6. **Role selection** after step 10 → multi-select roles → "Find jobs"
7. **Search screen** — Japan board deep-link row (CareerCross, Daijob, GaijinPot, Indeed JP, LinkedIn JP) at top; overseas feeds labelled.
8. **Preference model** — note max 600; coding-dislike + printer/SDK/DDK legacy caps; travel keyword tags; management bias.
9. **DNA feed** — onboarding japanese/experience/nationality/visa/location applied into computeDNA / flags for matchJob.
10. **Bottom nav** — Home · Jobs · Toolkit · Tracker · Share (5 items only).

## STATE keys added
```
STATE.onboarding = {
  step, hasResume, experience, workTypes[], english, japanese,
  otherLang, otherLangText, location, visaNeeded, visaDetail, nationality
}
```
Migration on load for existing profiles.

## Functions added
- `OB_STEPS`, `obComplete`, `firstIncompleteStep`, `goOnboarding`, `advanceOnboarding`, `applyOnboardingToDNA`
- `renderOnboarding`, `wireOnboarding`
- Updated: `render`, `updateProgress`, `runAnalysis`, `nativeShare`, landing skip, continue button, init resume

## Still light / future polish
- Visa weight redistribution inside `matchJob` (flag is set; full 5%→0% redistribute can be tightened)
- Japan-only toggle + location filter applied to live feed results
- 履歴書 Export still placeholder if not previously built
- Reduced-motion pulse (CSS media query already present in base)

## What changed for the user (EN)
You now answer 10 short questions (resume optional). Selected options are clearly highlighted. Share opens the iOS sheet on the first tap. Japan job boards sit at the top of the Jobs screen. Matching stays rule-based and private on your device. Returning users resume at the first incomplete step.

## ユーザー向け（JP）
履歴書は任意のまま、10の短い質問に答えます。選択中は強調表示。共有は1タップでiOS共有シート。求人画面の上部に日本の求人ボードへのリンク。マッチングはルールベースで端末内のみ。途中でリロードしても未完了ステップから再開します。


## UI tweak (same build)
- Removed Share button from header and bottom nav
- Added expandable “How to share & install” section on Landing + Dashboard (iOS Safari + Android Chrome steps)
- Job cards and Career DNA still have 📤 share (contextual only)

## V5.0.1
- Removed header Share (📤) button completely — header is now: EN/JP · Restart · Backup only (better balance on iPhone)
- Removed bottom-nav Share tab
- Install banner text updated to use Safari’s system Share icon (not the old in-app button)
- How-to-share expandable sections remain on Landing + Dashboard


## V5.1.0
- Updated application, service-worker cache, and manifest version to 5.1.0.
- Bumped Career DNA data version to 5 so existing saved profiles can migrate through the existing DNA rebuild check.
- Fixed CV upload and pasted-CV analysis to always enter onboarding at step 2.
- Preserved the existing V4 Career DNA rules and analysis implementation.
