# LunchSpin

A personal food-decision PWA for Singapore. Picks a restaurant for you based on which mall you're at, who you're with, how much you want to spend, and what kind of meal you're after.

Built as a self-hosted PWA — installs to your phone home screen, runs offline, and deploys to a home server (e.g. CasaOS) via Docker.

---

## What it does

Open the app and you get two paths to a restaurant:

- **🎲 Surprise Me** — random pick from everywhere
- **Pick a place** — tap a mall card (JEM, Westgate, AMK Hub, Causeway Point, Northpoint City, Lot One, YewTee Point) and get a random pick from that mall

From the result page:
- **Let's Go!** — opens Google Maps with the restaurant pre-queried, marks the place as visited
- **Re-roll** — try another pick within the same scope
- **Try anywhere instead** — when you came in via a mall, this widens the scope to all malls

Optional **Refine** panel adds 6 filter dimensions:
- **Price** — $ (under $10) · $$ ($10–$25) · $$$ ($25+)
- **With** — Solo · Date · Work lunch · Family
- **Service** — Dine-in · Takeaway
- **Ordering** — Individual (own dish each) · Shared (叫料吃 — order to share)
- **Payment** — Split · Treat (someone treats)
- **Cuisine** — Japanese · Chinese · Thai · Korean · Western · Italian · Hawker · Indian · Malay · Vietnamese · Multi-cuisine

The result page shows a **"Matched:"** chip row confirming which filters this restaurant satisfies, plus context badges if the choice is narrowing (dine-in only, treat-worthy, shared dining, etc.).

---

## Restaurants

**263 restaurants across 7 malls** — all real, currently-operating venues in the user's everyday geography (north and west Singapore):

| Mall | Area | Count |
|---|---|---|
| JEM | Jurong East | 38 |
| Westgate | Jurong East | 45 |
| Causeway Point | Woodlands | 46 |
| AMK Hub | Ang Mo Kio | 45 |
| Northpoint City | Yishun | 54 |
| Lot One | Chua Chu Kang | 19 |
| YewTee Point | Yew Tee | 16 |

Each restaurant entry has:
- Name, area, mall, cuisine[], meal[] (lunch/dinner), price range
- Open days, tags, descriptive notes
- 4 archetype-derived fields used for filtering: `service`, `ordering_style`, `suitable_for`, `pay_style`

Restaurant data lives in `public/data/restaurants.json` — fetched once on app load, kept in Pinia, filtered in memory. No backend required.

---

## Manage screen

A second tab lets you curate the list:
- Toggle any restaurant on/off (saved to localStorage, doesn't edit the JSON)
- Search by name or area
- Filter view: All / Active / Hidden
- See last-visited date per restaurant
- "Recent" badge for places visited in the last 3 days

The `pickRandom` algorithm de-prioritises recently-visited restaurants automatically. When this happens, the result page surfaces a small "Avoiding N places you visited recently" subtitle so you know why.

---

## Tech stack

- **[Nuxt 3](https://nuxt.com)** — Vue framework with SSR + hybrid rendering
- **[Pinia](https://pinia.vuejs.org)** — state management (single `restaurants` store)
- **[Nuxt UI](https://ui.nuxt.com)** + **[Tailwind CSS](https://tailwindcss.com)** — components + styling
- **[@vite-pwa/nuxt](https://vite-pwa-org.netlify.app)** — PWA manifest + service worker (Workbox)
- TypeScript throughout, mobile-first dark theme

PWA features:
- Installable on iOS and Android home screens (with iOS install hint banner)
- Maskable icon for proper Android adaptive icon
- Safe-area insets for notched devices (`viewport-fit=cover`, `black-translucent` status bar)
- Service worker caches app shell + restaurant JSON for offline use
- Offline banner shown when network drops

Accessibility:
- All interactive elements ≥44px tap target
- `aria-pressed` on every filter toggle, `aria-expanded`/`aria-controls` on disclosures
- WCAG AA text contrast
- `prefers-reduced-motion` respected globally
- Focus-visible orange ring on keyboard nav

---

## Project structure

```
.
├── app.vue                    # Mounts store, rehydrates filters from localStorage
├── nuxt.config.ts             # PWA manifest, theme, viewport
├── tailwind.config.ts
├── assets/
│   └── css/main.css           # Page/collapse/reroll/list transitions, focus styles
├── components/
│   └── IosInstallHint.vue     # iOS Add-to-Home-Screen banner
├── composables/
│   └── useVisitHistory.ts     # localStorage-backed visit tracking (3-day recency)
├── layouts/
│   └── default.vue            # Bottom nav, offline banner
├── pages/
│   ├── index.vue              # Home: Surprise Me + filters + location grid
│   ├── result.vue             # Restaurant card + Let's Go / Re-roll
│   └── manage.vue             # Toggle list with search + filter tabs
├── public/
│   ├── data/restaurants.json  # The 263 restaurants
│   └── icons/                 # PWA icons (192, 512, maskable)
└── stores/
    └── restaurants.ts         # Pinia store: filters, pickRandom, filterSummary
```

---

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # Production build to .output/
npm run preview    # Preview the production build
```

Requires Node 22+.

---

## Deployment (Docker → GHCR → CasaOS)

The project is set up for self-hosting on a home server.

### How it works

1. Push to `main` on GitHub
2. **GitHub Actions** (`.github/workflows/docker-publish.yml`) builds a multi-arch Docker image (linux/amd64 + linux/arm64) and pushes it to GitHub Container Registry as `ghcr.io/<your-username>/lunchspin:latest`
3. On your CasaOS box (or any Docker host), pull the new image and restart

### One-time CasaOS setup

Copy [`casaos-compose.yml`](casaos-compose.yml) to your CasaOS server. The default compose maps the app to host port `13001`:

```yaml
services:
  lunchspin:
    image: ghcr.io/isaactan98/lunchspin:latest
    container_name: lunchspin
    ports:
      - "13001:3000"
    restart: unless-stopped
```

Bring it up:

```bash
docker compose -f casaos-compose.yml up -d
```

Visit `http://<casaos-ip>:13001` from your phone → **Share → Add to Home Screen** (iOS) or the install prompt (Android).

### Subsequent updates

After every `git push origin main`, wait for the GitHub Action to finish, then on the server:

```bash
docker compose -f casaos-compose.yml pull
docker compose -f casaos-compose.yml up -d
```

Refresh the PWA on your phone to pick up the new version.

### Local Docker test

```bash
docker compose up --build   # uses docker-compose.yml (builds locally on port 3000)
```

---

## How filtering works

The Pinia store exposes a single `availableNow` getter that applies, in order:
1. Meal (auto-detected: lunch before 3pm, dinner after)
2. Open today (current day of week)
3. Active overrides (Manage page toggles)
4. Price filters (if any)
5. Cuisine filters (if any)
6. Service filter — restaurant must offer at least one of the selected modes
7. With (suitable_for) — restaurant must support at least one of the selected occasions
8. Ordering — `'both'` on the restaurant matches any filter; else direct match
9. Payment — `'either'` on the restaurant matches any filter; else direct match

`pickRandom(area?)` then:
- Restricts to the area if provided
- Avoids the `lastPickedId` (so consecutive re-rolls differ when possible)
- Prefers candidates NOT in `getRecentlyVisitedIds()` (3-day window); falls back to the full pool if filtering by recency would empty it
- Tracks how many recent picks were skipped in `lastPickSkippedRecent` (surfaced on the result page)

Filter state persists to `localStorage` under `lunchspin:filters` and rehydrates on next visit. If filters are active on load, the Refine panel auto-opens so the user sees what's filtering.

---

## Design system

Dark, orange-accented, mobile-first:

- Background: `slate-950` · cards: `slate-800` · borders: `slate-700`
- Primary action: `orange-500` (hover `orange-400`, active `orange-600`)
- Selected filter chip: `orange-600` with `orange-500/30` shadow
- Cuisine chips on result card: `orange-500/15` ghost
- Body text: `slate-200` · metadata: `slate-400` (WCAG AA compliant)
- Corner radii: `rounded-2xl` for cards/hero buttons, `rounded-xl` for inputs/secondary tiles, `rounded-full` for chips

All transitions use GPU-friendly `opacity` + `translate3d`, 140–180ms durations, with `will-change` hints for first-frame smoothness on mobile.

---

## Future ideas (not implemented)

- Bulk visit-history clear in Manage
- Share-pick deeplink (`/result?id=...`)
- Quick-filter presets ("Date night", "Work lunch", "Family weekend", "Solo & quick")
- Pin/weight favourite restaurants in the random pool
- Per-restaurant note editing
- "Truly random" escape hatch (long-press Surprise Me to ignore filters)

---

## License

Personal project. Not licensed for redistribution.
