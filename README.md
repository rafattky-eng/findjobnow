# FindJobNow

Free, privacy-first job search assistant for **English-friendly jobs in Japan**.

- No signup, no backend
- All data stays in the browser (IndexedDB)
- Single-page PWA (vanilla HTML/CSS/JS)

## Features

1. **Landing** — Hero + CTAs for CV upload or browse boards
2. **CV / Profile** — PDF (pdf.js) or paste text → client-side parse (name, skills, titles, years, languages, visa). Editable profile card
3. **Job Matching** — Score ~20 sample jobs by skill overlap + language/visa fit; recommended boards
4. **Job Board Directory** — 14 curated Japan-focused boards, filterable by Tech / Teaching / General / Startup / Multilingual
5. **Application Tracker** — Kanban: Interested → Applied → Interview → Offer → Rejected
6. **Tools** — Cover letter draft generator, Rirekisho checklist, scam safety checklist
7. **Backup / Restore** — Export / import full local data as JSON
8. **EN / JP** UI toggle

## Design

- Mobile-first, max-width 520px
- Colors: bg `#05070c`, panel `#0c1526`, gold `#d4b062`, text `#f5f1e8`, muted `#8fa3c4`
- Rounded cards, soft shadows, pill tags

## Deploy

### GitHub Pages

1. Create a repo (e.g. `findjobnow`)
2. Push the contents of this folder to the `main` (or `gh-pages`) branch
3. Settings → Pages → Source: Deploy from branch → `/` (root)
4. Site will be at `https://<user>.github.io/findjobnow/`

### Cloudflare Pages

1. Connect the GitHub repo in Cloudflare Dashboard → Pages
2. Build command: leave empty (static)
3. Output directory: `/` (or leave default)
4. Deploy

### Local test

```bash
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080` (service worker needs a proper origin, not `file://`).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Full app (inline CSS + JS) |
| `manifest.json` | PWA manifest |
| `sw.js` | Cache-first service worker |
| `icon-192.png` / `icon-512.png` / `apple-touch-icon.png` | Icons |

## Privacy

No analytics, no accounts, no server-side storage of CV or application data. Network is only used for:

- Loading pdf.js from CDN (optional offline cache)
- Opening external job board links in a new tab

## License

MIT — use freely.
