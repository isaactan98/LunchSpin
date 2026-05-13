# LunchSpin Design Review — Implementation Spec

Three parallel design reviews (visual, UX, mobile/PWA/a11y) produced this consolidated change list. Implement everything in **P0** and **P1** below. **P2** is polish — do them if non-disruptive. Skip the "Future ideas" section at the bottom unless explicitly requested.

After each change set, run `npm run build` to confirm nothing regressed.

---

## P0 — Critical (must do)

### 1. Safe-area insets for notched devices

iOS standalone PWA hides the bottom nav under the home indicator and the top header under the status bar.

- **`nuxt.config.ts`** — change viewport meta to:
  ```ts
  { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
  ```
- **`nuxt.config.ts`** — change `apple-mobile-web-app-status-bar-style` from `default` to `black-translucent`.
- **`layouts/default.vue`** — bottom `<nav>` add Tailwind class `pb-[env(safe-area-inset-bottom)]`.
- **`layouts/default.vue`** — offline banner div add `pt-[env(safe-area-inset-top)]` so it doesn't slide under the notch.
- **Page headers** (`pages/index.vue`, `result.vue`, `manage.vue`) — change `pt-8` / `pt-6` on the topmost header element to also respect the top inset via a wrapping div with `pt-[env(safe-area-inset-top)]`, or change to `pt-[max(2rem,env(safe-area-inset-top))]`.

### 2. Touch targets ≥44px

- **`pages/manage.vue`** — toggle button is `h-6 w-11`. Wrap or pad the `<button>` so its hit area is ≥44px tall (the visual switch stays the same size). Add `p-2 -m-2` or wrap in a larger clickable container.
- **`pages/result.vue`** — back button is `w-10 h-10`. Bump to `w-11 h-11`.
- **`pages/index.vue`** — cuisine chips `py-1.5` (~26px) — bump to `py-2.5` so they reach ~36–40px. Same for price filter pills if under 44px in practice.

### 3. Empty state when nothing matches

Two distinct failure modes need distinct handling:

- **All restaurants hidden** (`store.visible.length === 0`): `pages/index.vue` should replace the Surprise Me + grid with a centred empty state ("All restaurants are hidden") and a button linking to `/manage`.
- **0 places match current filters** (filters narrowing to nothing): show a prominent "Clear filters" button under the Surprise Me area when `totalAvailable === 0 && hasActiveFilters`. Don't just show amber text below the button.

### 4. Visit history influences picks

In `stores/restaurants.ts` `pickRandom()`:
- Import a helper from `useVisitHistory` (or duplicate the 3-day logic in the store) to get `recentlyVisited` IDs.
- After filtering by area/filters, **prefer** pool members NOT in `recentlyVisited`. Only fall back to recently-visited if the filtered pool is otherwise empty (same pattern as the existing `lastPickedId` avoidance).
- On `pages/result.vue` if the picked restaurant IS recently visited, show a small "Last visited 2 days ago" line (use the existing `useVisitHistory().getLastVisited`).

### 5. "Let's Go" should open directions

In `pages/result.vue` `onLetsGo()`:
- Construct a Google Maps deeplink:
  ```ts
  const q = encodeURIComponent(`${restaurant.value.name} ${restaurant.value.mall ?? ''} ${restaurant.value.area} Singapore`.trim())
  const url = `https://www.google.com/maps/search/?api=1&query=${q}`
  ```
- Call `markVisited(restaurant.value.id)` then `window.open(url, '_blank')` then router back to `/`.

### 6. Maskable icon needs padding

The current `icon-512.png` is referenced as both regular and maskable. Maskable needs ~40% safe zone, otherwise Android crops the logo edges.
- Generate a new `public/icons/icon-512-maskable.png` with the LunchSpin glyph centred at ~60% of the canvas (the rest is brand-colour padding). Use the existing `sharp` dev dep + the SVG generator approach.
- In `nuxt.config.ts` PWA manifest icons array, point the `purpose: 'maskable'` entry at `/icons/icon-512-maskable.png`.

### 7. WCAG AA contrast

- Replace all `text-slate-500` used for **body or important metadata** with `text-slate-400`. Specifically:
  - `pages/index.vue` price-range hint, "Or pick a place" header subtitle, area-card place counts, area name in dimmed mode, etc.
  - `pages/result.vue` "Open days" label
  - `pages/manage.vue` stats line, last-visited line
- Reserve `text-slate-500` only for genuinely tertiary info that doesn't carry meaning.
- Closed open-day dots: change `text-slate-600` → `text-slate-500` and `border-slate-700` (keep) on slate-900 background.

### 8. iOS install hint

iOS Safari doesn't fire `beforeinstallprompt`. Add a small dismissible component:
- New component `components/IosInstallHint.vue` that shows a slate-800 banner with "Install: tap Share → Add to Home Screen" when `/iPhone|iPad/.test(navigator.userAgent) && !navigator.standalone && !localStorage.getItem('lunchspin:ios_hint_dismissed')`.
- Render it once at the top of `pages/index.vue` (below the header).
- Dismiss button writes `lunchspin:ios_hint_dismissed = '1'` to localStorage.

---

## P1 — Important (should do)

### 9. Filter summary when collapsed

In `pages/index.vue`, when filters are active AND `filtersOpen === false`, show a one-line summary under the Refine row:
- e.g. `$$ · Japanese, Korean` with muted slate-400 text
- This way the user always sees what's narrowing their pool even when Refine is closed.

### 10. Drop violet — unify accent on orange

- `pages/index.vue` cuisine chips: change selected state from `bg-violet-600 border-violet-600` to `bg-orange-500/15 text-orange-300 border-orange-500/30 ring-1 ring-orange-500/40` (so selected state still reads but matches the orange-tinted ghost style used on the result card).
- Or simpler: selected `bg-orange-500 border-orange-500 text-white` like the price pills. Pick one and apply consistently across the cuisine and area filter chips.

### 11. Unify corner radii

- Hero "Surprise Me" button: `rounded-3xl` → `rounded-2xl`.
- Manage restaurant cards: `rounded-xl` → `rounded-2xl`.
- All page-level cards/buttons: `rounded-2xl`.
- Inputs, secondary tiles, small interactive elements: `rounded-xl`.
- Chips/pills/badges: `rounded-full`.

### 12. Hidden cards on Manage — drop opacity-50

In `pages/manage.vue` hidden card branch:
- Remove `opacity-50` from the card.
- Use `bg-slate-900 border-slate-800` (already there) but change inner text to `text-slate-500` for the name and `text-slate-600` for metadata so things are dimmed legibly.
- Add a small "Hidden" pill (top-right, similar to the green "Recent" pill but with `bg-slate-700/50 text-slate-400 border-slate-600/30`).

### 13. Result card hero treatment

The picked restaurant card looks like any other card. Make the pick feel earned:
- Wrap the card with `ring-1 ring-orange-500/20 shadow-2xl shadow-orange-500/10` so it glows subtly.
- Optionally add a thin gradient top edge — but ring + shadow is enough.

### 14. "Try Another" feedback

In `pages/result.vue`:
- Rename button text from "Try Another 🔄" to "Re-roll" (consistent with the dice metaphor on Home).
- Add a transient state on click: bind a `rerolling` ref, set to `true` for 200ms, fade card opacity to 0.5 during it (CSS transition).
- Keep the existing "That's the only option here!" inline message logic.

### 15. Bottom nav: aria-current + safe area + active indicator

In `layouts/default.vue`:
- Add `:aria-current="route.path === '/' ? 'page' : undefined"` to the Home `<NuxtLink>` and similarly for Manage.
- Already covered in P0 (item 1) safe-area-inset-bottom.
- Add a small active indicator dot or top bar on the active link — a 2px wide rounded-full bar at the top of the link's box, shown only when active.

### 16. Focus-visible ring

Add to `assets/css/main.css`:
```css
:focus-visible {
  outline: 2px solid #f97316;
  outline-offset: 2px;
  border-radius: 4px;
}
button:focus:not(:focus-visible),
a:focus:not(:focus-visible) {
  outline: none;
}
```

### 17. Reduced motion

Append to `assets/css/main.css`:
```css
@media (prefers-reduced-motion: reduce) {
  .page-enter-active, .page-leave-active { transition: none; }
  .page-enter-from, .page-leave-to { transform: none; }
}
```

### 18. Snapshot the meal at pick time

In `stores/restaurants.ts`:
- Add `lastPickedMeal: MealType | null` to state.
- Set it in `pickRandom` alongside `lastPickedId`.
- In `pages/result.vue` header title, derive lunch/dinner from `store.lastPickedMeal` instead of recomputing time.

---

## P2 — Polish (do if time permits)

### 19. Typography normalisation

- Eliminate every `text-[10px]` and `text-[11px]` arbitrary value — promote to `text-xs` (12px). Files: `pages/manage.vue` tag pills (lines around 103, 111), `pages/result.vue` tag pills (around 109).
- Standardise page H1: `pages/index.vue` `text-3xl` → `text-2xl font-bold tracking-tight`. `pages/manage.vue` keep `text-2xl`. `pages/result.vue` keep `text-xl`. So home and manage match, result stays smaller (it's a content page).

### 20. Meal badge simplification

In `pages/result.vue`:
- Drop the `text-amber-300` and `text-indigo-300` text colours. Keep the chip neutral `text-slate-200`, and tint only the sun icon `text-amber-400` and moon icon `text-slate-300`. Less rainbow.

### 21. Offline banner soften

In `layouts/default.vue`:
- Change `bg-amber-500 text-amber-950` → `bg-amber-500/15 text-amber-300 border-b border-amber-500/30`.

### 22. Manage tag pills match Result pills

In `pages/manage.vue`:
- Change `bg-slate-700 text-slate-300 rounded-full px-1.5 py-0.5 text-[10px]`
- To `bg-slate-900 text-slate-400 border border-slate-700 rounded-md px-1.5 py-0.5 text-xs`

### 23. Open-days simplification

In `pages/result.vue`:
- Since `availableNow` already filters by today, replace the 7-circle row with a single line:
  - If open all 7 days: omit entirely.
  - Otherwise: "Open today · also Mon, Wed, Fri" in `text-slate-400 text-xs`.

### 24. Decorative icon aria-hidden

In `pages/index.vue`, `pages/result.vue`:
- Add `aria-hidden="true"` to all `<UIcon>` that are purely decorative (map-pin in chips, dice emoji, rocket emoji, sun/moon if accompanied by text). Keep ARIA labels on icons that ARE the only thing communicating meaning.

### 25. Manage sticky header offset robustness

In `pages/manage.vue` area headers use `sticky top-[180px]`. Replace with CSS variable approach or measure the header height via `useElementBounding` and bind to `:style="{ top: headerH + 'px' }"`. If complex, drop the sticky area headers entirely and rely on visual separation.

### 26. Scope chip wording on Result

In `pages/result.vue`:
- When no area and no filters: hide the chip entirely.
- When filters active: include them in the chip text — e.g. "Japanese, $$ · anywhere" or "Japanese, $$ · JEM".

---

## Future ideas (do NOT implement now)

These were suggested by the UX agent — leave them out of this pass:
- Share-pick deeplink
- "Pin" restaurants to weight them up
- Weekly recap
- "Not today" temp deweight beyond Re-roll
- Bulk clear visit history
- First-launch onboarding line

---

## Acceptance criteria

After implementation:
1. `npm run build` passes with zero errors.
2. Dev server (`npm run dev`) loads home with no console errors.
3. Surprise Me → result → Re-roll works without flicker.
4. Location card → result shows the mall name in the scope chip.
5. Let's Go opens a new tab to Google Maps with the restaurant query and saves the visit before returning home.
6. Manage page toggles still work; hidden cards no longer use `opacity-50`.
7. All `text-[10px]` and `text-[11px]` are gone from the codebase.
8. No `violet-` class remains in the codebase.
9. `grep -r "rounded-3xl" pages/ components/` returns nothing.
10. Page renders cleanly under iOS-style notch (visual check via dev tools simulator).
