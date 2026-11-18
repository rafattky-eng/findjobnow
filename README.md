# FindJob Now V9.1.1

## Fixes in this build
- **GaijinPot** broken search URL fixed (`/en/job?keywords=`)
- **Easy Apply tab first** (main target)
- **Live jobs** tab renamed (was Matches) — this is where real vacancy cards with **Apply now** appear
- Clearer messaging: Easy Apply boards open search/apply sites; Live jobs = specific positions from employer feeds
- More **Greenhouse** company boards for Japan-eligible live listings (Airbnb, Stripe, Figma, Mercari, Cloudflare, Nintendo, Datadog, …)

## How to use (high priority path)
1. Upload your PDF once (Home).
2. **Easy Apply** tab → open a board that supports Easy Apply / CV upload → pick a job on that site.
3. **Live jobs** tab → Refresh → open a real vacancy card → **Apply now** (note copied + page opens) or **Email apply** / **My CV**.

## Limit (honest)
Japan boards (GaijinPot, CareerCross, Daijob, etc.) do not publish open APIs. The app cannot list their individual jobs as cards without scraping (not allowed).  
Live job cards come from public employer feeds (Greenhouse + remote feeds filtered for Japan).

Deploy → hard-refresh for service worker `fj-v9.1.1`.

Copyright © 2026 Rafat Kotaki.
