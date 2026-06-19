# LunchSpin UIUX Overhaul Spec

## Core principle
**One screen, one obvious next step.** Home asks one question ("where?"), Result answers one question ("yes or no?"), My Places curates the pool. Refinement is a quiet sidecar. Stop renaming the same button four ways — name the *action*, show the *scope* below it.

## Top 5 changes ranked
1. **Lock the primary CTA label to "Spin"** (verb-only) with scope as subtitle. Kill the four dynamic labels.
2. **Reorder Home**: header → CTA → area grid → Refine (collapsed at bottom). Filters move *below* areas so users can't read them as a prerequisite.
3. **Result page: collapse the metadata.** Promote name/area/price/cuisine + "Let's Go" / "Spin again". Hide context badges, "Matched", open-days, tags, notes behind a single "Details" disclosure.
4. **Unify the three re-roll CTAs**: Result has *two* actions only — "Let's Go" and "Spin again". The "anywhere in SG" escape moves into the scope chip as a tappable "× clear scope" affordance.
5. **First-run hint rewrite**: replace the descriptive 3-bullet card with a single tiny speech bubble pointing at the Spin button.

---

## Changes per screen

### Home (`pages/index.vue`)

**H1. Single stable CTA label**
- Lines 54–75 (button block).
- Replace the v-if/v-else-if/v-else ladder with a single label: dice glyph + word **"Spin"**.
- Move all dynamic info to a subtitle `ctaSubtitle` computed:
  - no scope, no filters → `"Any place, anywhere"`
  - filters only → `"Matching your filters"`
  - 1 area → `"From {area}"`
  - 2 areas → `"From {a} & {b}"`
  - 3+ → `"From {a} + {n} more"`
- Template:
  ```vue
  <span class="inline-flex items-center gap-2">
    <span class="text-2xl group-active:rotate-12 transition-transform" aria-hidden="true">🎲</span>
    <span>Spin</span>
  </span>
  <span class="block text-sm font-normal text-orange-100/90 mt-1">{{ ctaSubtitle }}</span>
  ```

**H2. Reorder sections — Refine moves below areas**
- Current: CTA → Refine → area grid.
- New: CTA → area grid → Refine (still collapsed).
- The location grid is now the visible secondary action; Refine is for power users.
- Refine label: change from `"Refine my pick"` to `"Picky? Refine your pick"`. Keep the active-count pill.

**H3. Area grid header — action-led copy**
- Around line 370 ("Or pick specific places (tap as many as you like)").
- Change to `"Limit to a mall?"` with subtitle `"Tap to narrow the spin"`.

**H4. Quick-filters horizontal row above Refine**
- New block above the Refine collapsible card (after the area grid, before Refine).
- Horizontally-scrollable chips for the most-used filters: `$`, `$$`, `$$$`, `Solo`, `Date`, `Work lunch`. Tapping toggles immediately (calls `store.togglePriceFilter` / `store.toggleWithFilter`).
- Same orange-when-active styling as Refine chips. `min-h-[48px]` per ALL_AGES rules.
- Container:
  ```vue
  <div class="px-4 mt-4 flex gap-2 overflow-x-auto -mx-1 no-scrollbar">
    <!-- quick chips -->
  </div>
  ```
- Inside the Refine panel, the Price section can be removed (now upstairs) OR kept with a small caption "Quick filters". Pick whichever feels cleaner — recommended: KEEP Price inside Refine too so the full panel is still complete, just acknowledge the quick chips above.

**H5. Collapse the zero-match cleanup stack into one inline banner**
- Lines 88–128. Currently shows: "Clear all filters" button + "Clear area selection" button (conditional) + relax suggestion line + removable filter chips. Up to 4 stacked elements.
- Replace with a single banner:
  ```
  No matches.  [Remove Cuisine] to see 8 places.  [Clear all]
  ```
- Keep `relaxSuggestion` button (single tap removes the worst-offender filter). Keep "Clear all" as a text link beside it. Drop the dedicated area-clear button and the removable-chip rail (they're redundant with the inline filter buttons users can untoggle directly).

**H6. Empty state CTA (already fine)**
- Lines 33–49 (`noVisible` branch). Preserve as-is.

---

### Result (`pages/result.vue`)

**R1. Two-action footer**
- Lines 169–195. Keep only **"Let's Go! 🚀"** and **"Spin again"**.
- DELETE the `Try anywhere instead` / `Pick from anywhere in Singapore` button.

**R2. Tappable scope chip with × to clear**
- Lines 17–26. Wrap the chip in a `<button>` with an inline `i-heroicons-x-mark`.
- New `onClearScope()` method:
  - `router.replace({ path: '/result' })` (strip `?areas`)
  - Call `store.pickRandom()` with no scope
- Visual: `"From Jurong East"` with a tiny × icon on the right. Chip becomes interactive only when `hasAreaScope` is true.

**R3. Collapse heavy metadata into `<details>` disclosure**
- Lines 76–144 (context badges, Matched chips, open-days, meal badges, tags, notes).
- Keep above the fold: name, mall · area, price, cuisine chips, last-visited.
- Wrap the rest:
  ```vue
  <details class="mt-4 group">
    <summary class="text-sm text-slate-400 cursor-pointer inline-flex items-center gap-1 list-none">
      Details
      <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 group-open:rotate-180 transition" aria-hidden="true" />
    </summary>
    <div class="mt-3 space-y-4">
      <!-- meal badges, open-days, tags, notes, context badges -->
    </div>
  </details>
  ```
- Hide the `summary::-webkit-details-marker` via CSS or `list-none` if Tailwind v3 (it is).

**R4. Delete the "Matched:" chip row entirely**
- Lines 88–96. The user just set those filters seconds ago — restating them is noise.

**R5. Promote visit-history skip notice**
- Around line 382 (`metaLine`).
- Stronger copy: instead of `"Avoiding 2 places you've been to recently"` → `"Skipped 2 places you've been to this week"`.
- Add an inline secondary link `"Include them"` that triggers a session-only flag `store.ignoreRecentThisSession = true`. New ref/action in the store. Reset on next mount.
- Visual: still slate-300 chip, but bigger (`text-sm`) and centred.

**R6. Reroll button copy**
- Line 188. `"Try a different place"` → **"Spin again"**.

---

### My Places (`pages/manage.vue`)

**M1. Page title + subtitle rewrite**
- Page title (`<h1>`): change `"My Places"` → `"Your restaurant list"`.
- Subtitle: change `"Hide places you don't want to see"` → `"Toggle places off so the spinner skips them"`.
- Bottom nav label stays `"My Places"`.

**M2. Visit-history clear in the page header**
- Move the visit-history clear action up. Add a small overflow `⋯` button (i.e. `i-heroicons-ellipsis-horizontal`) inside the page header (right side, beside the title).
- Tapping opens a tiny popover or simple modal with `"Clear visit history (N places)"`.
- Implementation can be a `<details>` or a Headless menu — keep simple: a small ref `menuOpen`, click outside closes.
- Keep the existing in-page section at the bottom too for discoverability. Just add the header affordance.

**M3. Toggle label — drop "Showing/Hidden" text**
- Lines 185–187. The visible orange/grey switch state is universally understood. Remove the inline `Showing`/`Hidden` `<span>`. Keep `aria-label` and `aria-pressed` for screen readers.

---

### Layout / bottom nav (`layouts/default.vue`)

**L1. Hide bottom nav on `/result`**
- Result is a focus screen — it has its own primary actions in the body. The bottom nav competes with the thumb.
- Wrap the nav with `v-if="route.path !== '/result'"`.
- Don't remove anything else — the back button in result's header handles return.

**L2. Keep 2 tabs (Home, My Places)**
- Do NOT add a third tab. Two is right.

---

### First-run hints (`components/FirstRunHints.vue`)

**F1. Replace the descriptive card with a single speech bubble**
- Current: 3-bullet card that narrates what's visible.
- New: A small absolutely-positioned tooltip directly above the Spin button, styled as a speech bubble.
- Copy: **"Tap me. I'll pick lunch."** with a downward ↓ arrow icon.
- Dismiss conditions:
  - Tap × on the bubble
  - First time the user taps the Spin button (mark `lunchspin:onboarded_v1` on click)
- Render via Teleport or absolute positioning relative to the home `<template>`. Z-index above the CTA but below modals.

---

## Shared vocabulary

| Concept | Canonical term |
|---|---|
| The action of picking | **Spin** (verb), never "Pick one for me" / "Surprise Me" / "Try again" |
| Scope = which areas | **From {area}** in subtitles |
| Filter UI | **Refine** (panel), **filters** (items inside) |
| Hide/show list | **Your list** in body; "My Places" only as nav label |
| Random-from-anywhere | The default Spin (no subtitle qualifier) |
| Visited recently | **"You've been here recently"** — single phrasing |

---

## What we should NOT change
1. **Bottom nav (2 tabs)** — right scope for the app.
2. **Area-grid card pattern with count + disabled state** — works well as a scope picker.
3. **Visit-history skipping logic in `stores/restaurants.ts`** — silently smart, just surface it better.
4. **iOS install hint** — discreet and triggered correctly.
5. **Dark theme + orange CTA palette** — distinctive, accessible.

---

## Acceptance criteria

After implementation:

1. `npm run build` passes.
2. Home CTA shows literally `Spin` (verb) with a dynamic subtitle in all 5 states.
3. Home page section order: CTA → area grid → Refine.
4. Quick-filters horizontal row exists above the Refine card.
5. Zero-match state shows ONE banner with `Remove X` action + `Clear all` link (no separate area-clear button, no chip rail).
6. Result page footer has exactly 2 buttons: Let's Go + Spin again.
7. Scope chip on Result is tappable with × that clears scope.
8. Result page wraps badges/open-days/tags/notes inside a `<details>` disclosure labelled "Details".
9. `Matched:` chip row is GONE from result page.
10. Visit-history skip notice has new copy and an "Include them" link.
11. Reroll button reads `Spin again`.
12. My Places page title reads `Your restaurant list`, subtitle is the new copy. Nav label stays `My Places`.
13. My Places header has an overflow `⋯` button leading to a popover with "Clear visit history" (existing bottom section also stays).
14. Manage toggle no longer shows `Showing`/`Hidden` text (just the switch + aria-label).
15. Bottom nav is hidden on `/result`.
16. `FirstRunHints.vue` is rewritten to a single speech-bubble tooltip pointing at the Spin button.
