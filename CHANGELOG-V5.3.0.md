# FindJob Now V5.3.0

## 1. Matching uses onboarding answers
- **Nationality Japanese** → visa weight 0%, redistributed to experience (40%→45%)
- **Visa needed** → boost jobs that mention sponsorship; soft-penalize “must be authorised to work in US/EU”
- **Location preference** (Tokyo / Japan / overseas / both) → filters live results
- **Japan-only** checkbox on Jobs screen

## 2. 10-step onboarding (iPhone polish)
- Sticky Next bar with safe-area padding
- Next pulses only when the step is complete (`prefers-reduced-motion` respected)
- Larger tap targets (52px)
- Back uses a step history stack

## 3. Install banner slimmed
- One-line tip instead of full card: “Add to Home Screen — Safari Share → …”
- Still dismissible; stored in localStorage

## 4. Japan boards pre-filled with top role
- CareerCross, Daijob, GaijinPot, Indeed JP, LinkedIn JP open with the top selected (or DNA-best) role keyword when available

## Version
- APP_VERSION / footer: **5.3.0**
- Service worker: **fj-v5.3.0**
- manifest version: **5.3.0**

## Header / nav (unchanged from 5.0.1)
- Header: EN/JP · Restart · Backup (no Share)
- Bottom: Home · Jobs · Toolkit · Tracker
