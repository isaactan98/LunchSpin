# LunchSpin Review v4 — Filtering correctness + workflow polish

User feedback: "lack of correct filtering on the app". Senior Designer and PM audits both converged on the same root cause: **the Service filter is semantically wrong** and several data tags are too liberal. Plus a few workflow gaps and one big nav bug ("Let's Go" loses your spot).

Implement P0 and P1. P2 is nice-to-have. Skip "Future ideas".

After implementation, run `npm run build` and confirm no errors.

---

## P0 — Critical (must do)

### 1. Fix Service filter semantics — this is the user's "lack of correct filtering" complaint

**Problem:** Default `serviceFilters: ['dine-in', 'takeaway']` makes Service a permanent no-op for 99% of the dataset (all 202 restaurants offer dine-in, 0 are takeaway-only, 25 are dine-in only). Tapping "Dine-in" off actually *removes* the takeaway preference — opposite of what the user expects. The phrase "Dine-in" implies "I want to sit down" but the filter currently means "must support takeaway."

**Fix in `stores/restaurants.ts`:**
- Change default `serviceFilters: []` (empty = no filter, like every other dimension).
- Change `toggleServiceFilter` — remove the "refuse to leave empty" logic. Empty is now a valid state meaning "no filter."
- Remove the `serviceFilters.length !== 2` special case in `hasActiveFilters`, `filterSummary`, and `activeFilterCount`.
- Keep the predicate in `availableNow` but it now only runs when `serviceFilters.length > 0`:
  ```ts
  if (serviceFilters.length > 0 && !r.service.some(s => serviceFilters.includes(s))) return false
  ```

**Fix in `pages/index.vue`:**
- Update `activeFilterCount` computed to count `serviceFilters.length` (no special case).
- Update `activeFilterChips` similarly — Service chips now remove just one mode, no need to compensate for the "default both" assumption.
- Section header still reads "Service" but you may want to add a section tooltip "Filter by what the place offers — leave empty for any".

### 2. Fix "Let's Go" navigation — don't drop the user back to home

**Problem:** `pages/result.vue` `onLetsGo` calls `router.push('/')` AFTER opening the Maps tab. On mobile PWA the new-tab actually replaces the SPA — the user comes back to a blank home and loses the pick context entirely.

**Fix:** In `pages/result.vue` `onLetsGo`:
- Call `markVisited(restaurant.value.id)`.
- Call `window.open(url, '_blank')`.
- **Stay on the result page.** Remove the `router.push('/')` line.

This means if the user closes the Maps tab and returns to the PWA, they see the restaurant card they just decided on — they can tap Let's Go again to re-open Maps, or tap back to start fresh.

### 3. Re-audit liberal `date` tagging

**Problem:** 66 of 202 restaurants are tagged `[colleague, date, family]` via the broad "Chinese sit-down sharing" archetype rule. Several are NOT date venues — e.g. Song Fa Bak Kut Teh, hawker-style claypot stalls, dim sum counters, quick noodle joints.

**Fix:** Write a small one-off Node script at `/tmp/retag-dates.mjs` that reads `public/data/restaurants.json` and removes `date` from `suitable_for` for restaurants matching these heuristics:

- Name contains: "Bak Kut Teh", "BKT", "Song Fa", "Claypot Delights" (not "Restaurant"), "Hawker", "Noodles", "Hor Fun", "Bee Hoon", "Lor Mee", "Ma La Tang", "Mala Tang", "Wok Hey", "Chicken Rice" (only the express ones), "Stuff'd", "Yoshinoya", "Sukiya"
- Or: `price_range === 1` AND `cuisine` includes Hawker
- Or: cuisine = ["Hawker"] only (single-cuisine hawker entry)

Skip if name contains "Restaurant", "Crystal Jade", "Putien", "Dian Xiao Er", "Din Tai Fung", "Tan Yu", "Beauty In The Pot", "Wine Connection", "Brotzeit", "Casa Vostra", "Soup Restaurant", "Boon Tong Kee", "Tsui Wah" (those are valid date venues).

Also fix specific overrides:
- `jem-tipsy-bunny`: `ordering_style: 'shared'` (it's a cocktail bar).
- `westgate-miam-miam`: add `colleague` to `suitable_for`.
- `north-sushi-tei`: add `family` to `suitable_for`.

Run the script, verify the count of date-eligible places drops by ~20 (from 144 to ~120-125), then delete the script.

### 4. Surface "Why this pick?" on result page

**Problem:** When filters are active, the user has no way to verify the pick actually satisfies them. The existing `contextBadges` row shows venue properties but doesn't tie back to the user's filter selection.

**Fix in `pages/result.vue`:** Add a new computed `matchedFilters` that lists, for each active filter dimension, the value the picked restaurant satisfies. Render below the existing `contextBadges` row (or replace contextBadges entirely if simpler):

```vue
<div v-if="matchedChips.length" class="mt-3 flex flex-wrap gap-1.5">
  <span class="text-[10px] uppercase tracking-wide text-slate-500 mr-1 self-center">Matched:</span>
  <span
    v-for="chip in matchedChips"
    :key="chip"
    class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-orange-500/15 text-orange-300 border border-orange-500/30"
  >{{ chip }}</span>
</div>
```

`matchedChips` computed:
- For each active filter, derive the human label the restaurant satisfies.
- e.g. user filtered `priceFilters: [2]` and pick is $$: chip says "$$"
- e.g. user filtered `withFilters: ['family', 'date']` and pick supports both: chips "Family" and "Date"
- e.g. user filtered `orderingFilters: ['shared']` and pick is `'both'`: chip says "Shared (flexible)"
- If no filters active: render nothing.

This closes the trust loop the PM flagged.

---

## P1 — Important

### 5. "Try anywhere" escape on Result page when area is set

**Problem:** When user came in via a location card (e.g. Jurong East), tapping Re-roll only re-rolls within that area. No way to widen scope without navigating back to home.

**Fix in `pages/result.vue`:** When `areaParam` is set, add a small secondary text link below the Re-roll button:

```vue
<button
  v-if="areaParam"
  class="w-full py-2 text-xs text-slate-400 hover:text-orange-300 transition-colors"
  @click="onTryAnywhere"
>
  Try anywhere instead →
</button>
```

`onTryAnywhere`:
- Calls `store.pickRandom()` with no area
- Updates `router.replace({ path: '/result' })` to drop the `?area=` query so subsequent re-rolls also widen.

### 6. Empty-state filter-relax suggestion

**Problem:** When filters narrow pool to 0, the user only sees "Clear all filters" and a row of removable chips — no guidance on WHICH filter to remove.

**Fix in `pages/index.vue`:** Add a computed `relaxSuggestion` that for each active filter dimension, calculates `availableNow.length` if that one dimension is empty/default. Returns the dimension whose removal yields the highest count.

Render above the chips row in the zero-result branch:
```vue
<p v-if="relaxSuggestion" class="text-xs text-slate-400 mt-2">
  Remove <span class="text-orange-300 font-medium">{{ relaxSuggestion.label }}</span> to see {{ relaxSuggestion.count }} place{{ relaxSuggestion.count !== 1 ? 's' : '' }}
</p>
```

Computation: clone the filter state, set each dimension to default in turn, count results, return the best.

### 7. Reflow 3-col grid to 2-col on narrow screens

**Problem:** On 360px screens, the Service/Ordering/Payment 3-col grid is cramped — "Shared (叫料吃)" wraps awkwardly.

**Fix in `pages/index.vue`:** Change the grid container class from `grid grid-cols-3 gap-3` to `grid grid-cols-2 sm:grid-cols-3 gap-3`. Tailwind `sm` breakpoint is 640px so iPhone SE / 360px-class phones get 2-col, larger get 3-col.

### 8. Recent-visit override

**Problem:** `pickRandom` deprioritises recently-visited places silently. User has no way to override or see this.

**Fix in `stores/restaurants.ts`:** Add a `lastPickSkippedRecent: number` field — set to count of recent-visit IDs that were skipped during the last pick. Reset to 0 if no skips happened.

**Fix in `pages/result.vue`:** When `lastPickSkippedRecent > 0`, add a small subtitle under the scope chip:

```vue
<p v-if="store.lastPickSkippedRecent > 0" class="px-4 -mt-2 mb-2 text-xs text-slate-500">
  Avoiding {{ store.lastPickSkippedRecent }} place{{ store.lastPickSkippedRecent !== 1 ? 's' : '' }} you visited recently
</p>
```

Optional Phase 2: button "Show anyway" that re-rolls including recent visits. Skip if too much scope.

### 9. Filter summary separator consistency

**Problem:** `filterSummary` uses `/` (OR within dimension), `·` (AND across), and `, ` (for cuisines) — three separators for two concepts.

**Fix in `stores/restaurants.ts`:** Change all within-dimension joiners to `/`. Change cross-dimension separator to ` + ` (clearer "AND"). Drop the comma form.

Example before: `$$ · Solo/Date · Dine-in · Shared · Japanese, Thai`
After: `$$ + Solo/Date + Dine-in + Shared + Japanese/Thai`

### 10. Disabled area card — prevent `active:scale-95`

**Problem:** Tailwind's `active:scale-95` can still fire on `disabled` buttons in some browsers, causing a confusing "you can tap me" feedback.

**Fix in `pages/index.vue`:** Add `disabled:active:scale-100` to the area card button class.

---

## P2 — Polish

### 11. Cuisine count badge

In `pages/index.vue` Cuisine section header, add a count next to the "Clear" button:

```vue
<h3 class="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5">
  Cuisine
  <span v-if="store.cuisineFilters.length > 0" class="text-orange-300 font-normal lowercase">({{ store.cuisineFilters.length }})</span>
</h3>
```

### 12. Re-roll "Only 1 match" hint

When the user has filters active AND the pool after filtering is exactly 1, on first roll (not just re-roll), the result page should subtly indicate this.

In `pages/result.vue`, derive `availableNow.length` and if equal to 1 AND `store.hasActiveFilters`, show a small line near the top:

```vue
<p v-if="onlyOneMatch" class="px-4 -mt-2 mb-2 text-xs text-amber-300">
  Only 1 place matches your filters
</p>
```

### 13. Auto-close Refine after picking

When the user taps Surprise Me / Pick for me OR a location card, the Refine panel should close to keep the home page tidy when they come back.

In `pages/index.vue`, in `onSurpriseMe` and `onPickArea`, before routing add:
```ts
filtersOpen.value = false
```

### 14. Watcher should also close panel when filters cleared

Currently the watcher in `pages/index.vue` opens the panel when filters go from inactive → active, but never closes it. Add the reverse:

```ts
watch(() => store.hasActiveFilters, (now, prev) => {
  if (now && !prev) filtersOpen.value = true
  if (!now && prev) filtersOpen.value = false
})
```

---

## Future ideas (do NOT implement)

- Visit-history bulk clear in Manage
- Per-restaurant note editing
- Share-pick deeplink
- Filter-impact count next to each chip when collapsed

---

## Acceptance criteria

After implementation:

1. `npm run build` passes.
2. Service filter defaults to `[]` (empty); selecting one mode actually filters.
3. Service section no longer special-cased in `hasActiveFilters` / `filterSummary` / `activeFilterCount` / `activeFilterChips`.
4. "Let's Go" no longer routes back to home — user stays on result page after opening Maps.
5. `public/data/restaurants.json` has fewer entries tagged with `date` (Song Fa BKT, Tipsy Bunny, generic noodle/hawker places no longer mis-tagged).
6. Result page shows "Matched:" chips when filters are active.
7. "Try anywhere" link appears on Result when `areaParam` is set.
8. Zero-result branch shows "Remove X to see N places" suggestion.
9. 3-col grid reflows to 2-col on narrow screens (`grid-cols-2 sm:grid-cols-3`).
10. Recent-visit deprioritisation surfaces as a subtitle when skips happened.
11. Filter summary uses ` + ` between dimensions, `/` within.
12. Disabled area cards don't scale on tap.
13. Cuisine section header shows count.
14. Refine panel auto-closes when filters cleared and when navigating to result.
