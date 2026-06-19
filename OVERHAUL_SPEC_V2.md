# LunchSpin UIUX Overhaul Round 2 Spec

Round 1 unified the verb ("Spin"). Round 2 unifies the **scope**: every active constraint lives in ONE strip with ONE way to relax it. Eliminate duplicate controls.

Implement every change below. Verify against the 13 acceptance criteria at the end.

---

## Top 5 changes ranked
1. **Kill the duplicate Price block inside Refine.** Quick-filter chips upstairs and a full Price grid downstairs both toggle the same state.
2. **Promote the active-scope summary into a single "Spinning in:" strip** under the CTA. Replace the "Clear N selected" link and the zero-match banner with one row of removable chips.
3. **Make `primaryDisabled` legible.** Add a reactive caption that explains WHY the button is greyed out.
4. **Result `metaLine` is overloaded.** Split into two independent rows so "Include them" only renders next to its own message.
5. **`FirstRunHints` ordering.** Render AFTER `IosInstallHint`, and only when store loaded.

---

## Home (`pages/index.vue`)

### H-R2.1 — Remove the Price block from Refine
- Find the `<!-- Price -->` block inside `#refine-panel`.
- Delete it entirely.
- Add at the top of the panel:
  ```vue
  <p class="text-xs text-slate-400 -mt-1 pb-1">Price lives in Quick filters above.</p>
  ```
- Append `Family` to the Quick filters array (`quickFilters`) so it joins Solo / Date / Work lunch. Then ALSO delete the "With" section from `#refine-panel` (now redundant). Refine becomes: Service / Ordering / Payment / Cuisine only.

### H-R2.2 — Unified scope strip
- Replace the current "Clear N selected" mini-link AND the zero-match banner with ONE strip immediately under the CTA.
- Render whenever `store.hasAreaSelection || store.hasActiveFilters`:
  ```vue
  <div v-if="store.hasAreaSelection || store.hasActiveFilters" class="mt-3 rounded-2xl bg-slate-900 border border-slate-800 px-3 py-2">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-xs text-slate-400 mr-1">Spinning in:</span>
      <button
        v-for="chip in scopeChips"
        :key="chip.key"
        type="button"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-slate-800 border border-slate-700 text-slate-300 hover:border-orange-500/60 min-h-[36px]"
        :aria-label="`Remove ${chip.label}`"
        @click="chip.remove()"
      >
        {{ chip.label }}
        <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="ml-auto text-sm text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline px-2 py-1 min-h-[36px]"
        @click="store.clearAllScope"
      >
        Clear all
      </button>
    </div>
    <p v-if="zeroMatchHint" class="mt-2 text-sm text-slate-400">
      <span class="font-semibold text-white">No matches.</span>
      <button v-if="relaxSuggestion" type="button" class="text-orange-300 hover:text-orange-200 underline-offset-2 hover:underline" @click="onRelax">
        Remove {{ relaxSuggestion.label }} to see {{ relaxSuggestion.count }} place{{ relaxSuggestion.count !== 1 ? 's' : '' }}.
      </button>
    </p>
  </div>
  ```
- Implement `scopeChips` computed — flatten `selectedAreas` + each filter dimension into `{ key, label, remove() }` entries. Areas come first, then price → with → service → ordering → payment → cuisine.
- DELETE the standalone "Clear N selected" mini-link block.
- DELETE the zero-match banner block.
- DROP the `ctaSubtitle` line OR simplify to a single static `"Pick a place for you"`. (Pick whichever feels cleaner; the strip is now the primary scope surface.)

### H-R2.3 — Disabled-CTA reason caption
- Replace the existing `errorMessage` rose paragraph with a reactive `disabledReason` that renders whenever `primaryDisabled === true`:
  ```vue
  <p v-if="primaryDisabled && disabledReason" class="mt-3 text-center text-sm text-rose-300">
    {{ disabledReason }}
  </p>
  ```
- Computed:
  ```ts
  const disabledReason = computed(() => {
    if (!store.loaded) return ''
    if (noVisible.value) return 'All places are hidden — open My Places.'
    if (store.hasAreaSelection && selectedAvailable.value === 0)
      return store.hasActiveFilters
        ? 'Nothing in selected areas matches your filters.'
        : `Nothing open in ${store.selectedAreas[0]} for ${meal.value}.`
    if (totalAvailable.value === 0) return 'No places match your filters.'
    return ''
  })
  ```
- `errorMessage` ref can stay for transient inline errors but the reason caption is the primary "why disabled" affordance.

### H-R2.4 — Area-grid header simplification
- Drop the right-aligned `"{N} places match"` text (lives in scope strip now).
- Keep "Limit to a mall?" + "Tap to narrow the spin".

### H-R2.5 — Quick filters right-edge fade
- Wrap the quick-filters row container:
  ```vue
  <div class="relative">
    <div class="px-4 mt-4 flex gap-2 overflow-x-auto -mx-1 no-scrollbar">
      <!-- existing chips -->
    </div>
    <div class="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-slate-950" aria-hidden="true" />
  </div>
  ```

---

## Result (`pages/result.vue`)

### R-R2.1 — Split metaLine into two rows
- Remove the combined `metaLine` paragraph (around line 44).
- Replace with two independent renders:
  ```vue
  <div v-if="onlyOneMatch" class="px-4 mb-2 flex justify-center">
    <span class="inline-block bg-slate-800/60 border border-slate-700 rounded-full px-4 py-1.5 text-sm text-slate-300">
      Only 1 place matches your filters
    </span>
  </div>
  <div v-if="skippedRecentCount > 0" class="px-4 mb-3 flex justify-center">
    <span class="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 bg-slate-800/60 border border-slate-700 rounded-full px-4 py-1.5 text-sm text-slate-300 text-center">
      <span>Skipped {{ skippedRecentCount }} you've been to this week</span>
      <button
        v-if="canIncludeRecents"
        type="button"
        class="text-orange-300 hover:text-orange-200 underline-offset-2 hover:underline font-medium"
        @click="onIncludeRecents"
      >
        Include them
      </button>
    </span>
  </div>
  ```
- Add `skippedRecentCount = computed(() => restaurantsStore.lastPickSkippedRecent)`. Drop the `onlyOneMatch &&` short-circuit that was suppressing the skip-recents message.

### R-R2.2 — Trim scope chip to TWO compact chips
- Where the current `scopeChipText` lives, replace with:
  ```vue
  <div v-if="hasAreaScope || hasFiltersScope" class="px-4 mb-3 flex flex-wrap gap-2">
    <span v-if="hasAreaScope" class="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-sm text-slate-300">
      <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
      From {{ areaScopeLabel }}
      <button
        type="button"
        class="shrink-0 ml-1 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 min-h-[28px] min-w-[28px] inline-flex items-center justify-center"
        aria-label="Clear area scope"
        @click="onClearScope"
      >
        <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </span>
    <span v-if="hasFiltersScope" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-sm text-slate-400">
      <UIcon name="i-heroicons-adjustments-horizontal" class="w-3.5 h-3.5" aria-hidden="true" />
      Filtered: {{ filterScopeLabel }}
    </span>
  </div>
  ```
- `hasFiltersScope` = `store.hasActiveFilters`. `filterScopeLabel` = comma-joined human-readable summary derived from store.

---

## My Places (`pages/manage.vue`)

### M-R2.1 — Pick ONE place for "Clear visit history"
- Remove the overflow-menu item that clears visit history.
- Keep the bottom "Visit history" section as the single canonical surface.
- If the overflow menu has no other items, **remove the `⋯` button entirely** (and the `menuOpen` ref + click-outside handler).

### M-R2.2 — Move "Recent" badge inline
- Drop `absolute top-3 right-24` from the "Recent" badge.
- Render as an inline `<span>` immediately after the `<h3>{{ restaurant.name }}</h3>` (with `ml-2` for spacing).

---

## Layout / FirstRunHints / store

### L-R2.1 — Re-order `IosInstallHint` before `FirstRunHints`
In `pages/index.vue` (the `<template>`), swap so `<IosInstallHint />` renders BEFORE `<FirstRunHints />`. The bubble's downward tail now truly points at the CTA.

### L-R2.2 — Gate `FirstRunHints` on store loaded + visible
Change to `<FirstRunHints v-if="store.loaded && !noVisible" />`. Prevents the bubble pointing at the skeleton.

### S-R2.1 — `clearAllScope` store action
In `stores/restaurants.ts`:
```ts
clearAllScope() {
  this.clearFilters()
  this.clearAreaSelection()
  this.ignoreRecentThisSession = false
}
```
Called by the unified scope strip's "Clear all" button.

---

## What to leave alone
1. The dice + "Spin" CTA verb
2. Two-button result footer
3. Bottom nav hidden on /result
4. Speech-bubble copy "Tap me. I'll pick lunch."
5. Area grid sort: count desc → alpha

---

## Acceptance criteria

1. `$/$$/$$$` chips appear in exactly ONE place on Home (Quick filters row). Refine no longer has a Price section.
2. "With" filters live in Quick filters; Refine "With" section removed.
3. A single "Spinning in:" strip under the CTA lists area chips + filter chips, each with `×`; trailing "Clear all" link removes both.
4. The strip is the only zero-match recovery surface on Home (no separate banner, no "Clear N selected" link).
5. When the CTA is disabled, a rose-300 caption explains why — visible BEFORE the user taps.
6. Result page renders up to TWO independent meta pills: "Only 1 place matches your filters" and/or "Skipped N you've been to this week · Include them".
7. Result scope chip shows up to two pills: a tappable `From {area} ×` and a static `Filtered: …` when applicable.
8. My Places overflow menu is removed (or repurposed); "Clear visit history" lives only in the bottom section.
9. "Recent" badge sits inline with the restaurant name, not absolute-positioned.
10. `FirstRunHints` renders AFTER `IosInstallHint`, only when `store.loaded && !noVisible`.
11. Clearing `localStorage` re-shows the speech bubble on next mount.
12. `store.clearAllScope()` exists and clears filters + areas + `ignoreRecentThisSession` in one call.
13. `npm run build` passes.
