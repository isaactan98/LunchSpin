# LunchSpin Design Review v2 — Implementation Spec

Second-pass review after the 4 new filter dimensions landed. Three parallel reviewers (visual, UX, mobile/PWA/a11y) flagged regressions and new issues. Implement all of **P0** and **P1**. **P2** is polish — do them if non-disruptive. Skip the "Future ideas" section.

After each change set, run `npm run build` to verify nothing regressed.

---

## P0 — Critical (must do)

### 1. Touch targets on new Refine sections all under 44px

The new filter elements were specced too small.

- **`pages/index.vue` — With chips**: change `px-3 py-2 rounded-full text-xs` → `px-3.5 py-2.5 rounded-full text-sm` (renders ≥44px).
- **`pages/index.vue` — Service / Ordering / Payment 2-wide buttons**: change `flex-1 py-2.5 rounded-xl text-sm` → `flex-1 py-3 rounded-xl text-sm` on all three rows.
- **`pages/index.vue` — Cuisine chips**: change `px-3 py-1.5 rounded-full text-xs` → `px-3.5 py-3 rounded-full text-sm`.
- **`pages/index.vue` — Refine trigger button**: change `py-2` → `py-3`.
- **`pages/index.vue` — Cuisine "Clear" inline link**: add padding so it has a real hit area. `class="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 -mr-2 -my-1"`.
- **`pages/index.vue` — "Clear all filters" button**: change `py-2 text-xs` → `py-3 text-sm`.

### 2. ARIA pressed state on every filter button

Screen-reader users currently have no way to tell which chips are selected.

In `pages/index.vue`, add `:aria-pressed="<isSelected>"` to every toggle button across all 6 filter rows (Price, With, Service, Ordering, Payment, Cuisine). Example:

```vue
<button
  :aria-pressed="store.priceFilters.includes(opt.value)"
  ...
>
```

Use the existing selection check expression for each row (e.g. `store.priceFilters.includes(p)`, `store.withFilters.includes(opt.value)`, `store.serviceFilters.includes('dine-in')`, etc.).

### 3. Refine disclosure ARIA

The Refine collapsible button needs proper disclosure semantics:

- Add `:aria-expanded="filtersOpen"` and `aria-controls="refine-panel"` to the Refine trigger button.
- Add `id="refine-panel"` to the `<div v-if="filtersOpen">` panel below it.

### 4. iOS auto-zoom on Manage search input

`pages/manage.vue` search input uses `text-sm` (14px), which triggers iOS Safari auto-zoom on focus.

Change `class="... text-sm ..."` → `class="... text-base ..."` on the search input (16px doesn't trigger zoom).

### 5. Re-roll opacity transition bypasses prefers-reduced-motion

`pages/result.vue` uses `transition-opacity duration-200` for the Re-roll fade. The round-1 reduced-motion media query only covers page transitions.

Append to `assets/css/main.css` inside the existing `@media (prefers-reduced-motion: reduce)` block:

```css
@media (prefers-reduced-motion: reduce) {
  /* keep existing page-enter/leave rules */
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

### 6. Result page hides the 4 new filter dimensions

User filtered on "Takeaway + Treat + Shared" — gets a result with zero confirmation. Critical trust issue.

In `pages/result.vue`, insert a new metadata badge row between the cuisine chips and the open-days line (around line 64). Only render badges that are NARROWING (i.e. don't show "Dine-in" if both dine-in AND takeaway are available — that's not informative). Treatment:

```vue
<!-- Context badges: only show narrowing ones -->
<div v-if="contextBadges.length" class="mt-3 flex flex-wrap gap-1.5">
  <span
    v-for="b in contextBadges"
    :key="b.label"
    class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300"
  >
    <UIcon :name="b.icon" class="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
    {{ b.label }}
  </span>
</div>
```

Logic for `contextBadges` computed:
- If `restaurant.service.length === 1`: add badge for "Dine-in only" or "Takeaway only".
- If `restaurant.ordering_style === 'shared'`: add "Shared dining" with `i-heroicons-users` icon.
- If `restaurant.ordering_style === 'individual'` AND user has `orderingFilters` selected: add "Individual orders".
- If `restaurant.pay_style === 'treat'`: add "Treat-worthy" with `i-heroicons-banknotes` icon.
- If `restaurant.suitable_for.length === 1`: add "Best for {value}" (rare but informative).

Keep total badges ≤ 4 to avoid clutter.

### 7. Persist filters to localStorage

With 6 filter dimensions, losing filters on reload is now punishing.

In `stores/restaurants.ts`:
- Add new action `loadFilters()` that reads `lunchspin:filters` from localStorage and applies it to the 6 filter fields (with safe fallback to defaults).
- Add a Pinia subscriber (or a `$subscribe` on the store) that writes the 6 filter fields back to localStorage whenever they change.
- In `app.vue` `onMounted`, call `restaurantsStore.loadFilters()` after `loadActiveOverrides()`.

Make sure invalid stored values don't break — wrap JSON.parse in try/catch and validate each filter value against allowed set.

---

## P1 — Important (should do)

### 8. Add aria-live to filter count badge

When filters change, screen-reader users should hear the count update.

In `pages/index.vue` Refine trigger, wrap the `{{ activeFilterCount }} active` span with `aria-live="polite"` and `aria-atomic="true"`.

### 9. Refine section headers should be `<h3>`

Currently `<p class="text-xs uppercase...">`. Promote to `<h3>` for semantic correctness:

In `pages/index.vue`, change every section label `<p>` (6 sections: Price, With, Service, Ordering, Payment, Cuisine) to `<h3>` with the same class string (Tailwind doesn't care). Heading rotor will now expose these.

### 10. Combine Service / Ordering / Payment into compact 3-column grid

Three consecutive identical 2-wide button rows feel monotonous and add ~120px of height.

In `pages/index.vue`, merge them into a single 3-column compact section:

```vue
<div class="grid grid-cols-3 gap-3">
  <div>
    <h3 class="text-[11px] uppercase tracking-wide text-slate-500 mb-1.5">Service</h3>
    <div class="flex flex-col gap-1.5">
      <button ...>Dine-in</button>
      <button ...>Takeaway</button>
    </div>
  </div>
  <div>
    <h3 class="text-[11px] uppercase tracking-wide text-slate-500 mb-1.5">Ordering</h3>
    <div class="flex flex-col gap-1.5">
      <button ...>Individual</button>
      <button ...>Shared</button>
    </div>
  </div>
  <div>
    <h3 class="text-[11px] uppercase tracking-wide text-slate-500 mb-1.5">Payment</h3>
    <div class="flex flex-col gap-1.5">
      <button ...>Split</button>
      <button ...>Treat</button>
    </div>
  </div>
</div>
```

Each button should still meet 44px (use `py-3 text-sm` per the touch-target fix above). Also, since these are now vertical stacks, the "Shared (叫料吃)" label may need to wrap — use `whitespace-nowrap text-xs` if it overflows.

NOTE: This conflicts slightly with the "Shared (叫料吃)" label — keep the gloss but use `text-xs` (12px) in the compact buttons so it fits.

### 11. Section divider before Cuisine

The 6 sections feel like one flat list. Group logistics vs taste:

In `pages/index.vue`, wrap the Cuisine section with `<div class="pt-4 mt-4 border-t border-slate-800">` so there's a visual break before the cuisine cloud.

### 12. Persist + rebuild collapsed summary line

Currently the collapsed summary `truncate`s mid-token. Allow 2 lines:

In `pages/index.vue`, the summary `<p>` change `truncate` → `line-clamp-2 leading-snug` and bump to `text-[11px]`. Increase max-height accordingly.

Also extend the summary to genuinely reflect ALL active filters in order: Price → With → Service → Ordering → Payment → Cuisine. Use `·` as separator. Skip sections at default.

### 13. Result page scope chip should reuse the home summary

The home page already builds a perfect filter summary. The result page scope chip should reuse the same logic for consistency.

In `pages/result.vue`, replace the existing scope-chip computed with one that calls the same summary builder (extract it to a getter on the store, or duplicate the logic). The chip should now show all active filters, not just price/cuisine.

Keep the chip's `truncate` so it stays one line on small screens.

### 14. Zero-result recovery — show active filters as removable chips

When `totalAvailable === 0 && hasActiveFilters`, show inline "remove" chips for each active filter so the user can selectively undo, rather than nuking everything.

In `pages/index.vue` zero-result branch, render below the "Clear all filters" button:

```vue
<div class="mt-3 flex flex-wrap gap-1.5 justify-center">
  <button
    v-for="chip in activeFilterChips"
    :key="chip.key"
    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-300 hover:border-red-500/40"
    @click="chip.remove()"
    :aria-label="`Remove ${chip.label} filter`"
  >
    {{ chip.label }}
    <UIcon name="i-heroicons-x-mark" class="w-3 h-3" aria-hidden="true" />
  </button>
</div>
```

Where `activeFilterChips` is a computed that returns an array of `{ key, label, remove }` covering all active filters across the 6 dimensions.

### 15. Rename microcopy

- **"With → Colleague"** → **"Work lunch"** (scales 1-to-many, reads naturally).
- **"Payment → Treat"** → keep "Treat" but add a section subhead under the "Payment" label: `<p class="text-[10px] text-slate-600 mb-1">How the bill is handled</p>`.
- **"Ordering → Shared (叫料吃)"** — keep the Chinese gloss but also add an info tooltip (just a `title` attribute on the section h3): "Individual = own dish · Shared = order dishes to share, 叫料吃".

### 16. "Surprise Me" dynamic label

When `hasActiveFilters` is true, change the button text to "Pick for me" (honest). When no filters, keep "Surprise Me 🎲". Use a computed for the button label.

### 17. Drop the doubled-up ring + shadow on result card

Currently `pages/result.vue` has both `ring-1 ring-orange-500/20` AND `shadow-2xl shadow-orange-500/10` — competing. Drop the ring, bump shadow to `shadow-orange-500/15`. Cleaner single-glow effect.

---

## P2 — Polish (do if non-disruptive)

### 18. Active chip warmth

Currently `bg-orange-500 border-orange-500 text-white` is bright neon on dark slate. Soften:

- Change all selected filter buttons (across all 6 rows) to `bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30`.
- This applies to: Price buttons, With chips, Service/Ordering/Payment buttons, Cuisine chips.

### 19. Section header tightening

Across all Refine `<h3>` labels: change `mb-2` → `mb-1.5` and `text-xs` → `text-[11px]` for tighter vertical rhythm.

### 20. Manage page should surface new dimensions

Add tiny icon row beneath each restaurant's cuisine/price line. Icons:
- `i-heroicons-home-modern` if `service` includes `dine-in`
- `i-heroicons-shopping-bag` if `service` includes `takeaway`
- `i-heroicons-users` if `ordering_style` is `shared` or `both`

No labels — just icons for spot-checking data quality. ~16x16 muted slate-500.

### 21. Error text color

`text-amber-400` for "No places match" error is too similar to the meal-icon amber on `pages/result.vue` and to other accents. Change to `text-rose-300` for clear "this is a problem" semantics.

### 22. Filter persistence — don't lose them visually

When filters are persisted and rehydrated on next session, the user should see immediately that filters are on. The "N active" pill + summary line covers this — verify it's prominently visible. No code change if the pill is already there.

---

## Future ideas (do NOT implement now)

- Sticky "Show N results / Surprise Me" CTA inside expanded Refine panel (good idea but invasive).
- Quick filter presets: "Date night", "Work lunch", "Family weekend", "Solo & quick" (good for adoption, scope creep for now).
- Time-of-day suggestion chip ("It's Saturday dinner — filter for Date?").
- Filter-impact preview (count next to each chip showing N if tapped).
- "Truly random" escape hatch (long-press Surprise Me).

---

## Acceptance criteria

After implementation:

1. `npm run build` passes with zero errors.
2. All Refine filter buttons (Price, With, Service, Ordering, Payment, Cuisine) have `:aria-pressed` bindings.
3. Refine trigger has `:aria-expanded` + `aria-controls`; panel has `id="refine-panel"`.
4. Search input in Manage uses `text-base` (16px) — no more iOS zoom.
5. Reduced-motion media query in `main.css` includes a global `*` transition-duration override.
6. Result page card shows a context-badge row when filters are narrowing.
7. Filters persist to `lunchspin:filters` in localStorage; survive reload.
8. Refine `<p>` section labels are now `<h3>`.
9. Service / Ordering / Payment merged into a 3-column compact grid.
10. Cuisine section has a `border-t border-slate-800` separator above it.
11. Collapsed summary line uses `line-clamp-2`, not `truncate`.
12. Zero-result branch shows removable filter chips.
13. "Colleague" chip text → "Work lunch".
14. Surprise Me button text becomes "Pick for me" when filters active.
15. Result card has shadow but no ring.
