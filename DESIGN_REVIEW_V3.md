# LunchSpin Design Review v3 — Alignment + Smooth Workflow

Third-pass review focused on **alignment fixes** (the user reported a visible misalignment in the Service/Ordering/Payment grid) and **transition smoothness** across the whole app.

Three parallel reviewers ran in parallel:
- Designer 1: Layout & alignment audit
- Designer 2: Motion & transitions
- Designer 3: Flow & state consistency

Implement P0 and P1. P2 is polish. Skip the "Future ideas" section.

After each major group, run `npm run build` to verify.

---

## P0 — Critical (must do)

### 1. Fix the misaligned Service/Ordering/Payment grid

This is the visible bug in the user's screenshot. The Payment column has a `<p>` subhead "How the bill is handled" that pushes its buttons DOWN below the Service and Ordering columns.

In `pages/index.vue` around line 210-211:

**Delete the subhead `<p>` entirely.** Move the explanatory text to a `title` attribute on the `<h3>` (consistent with the Ordering column that already does this).

Before:
```vue
<div>
  <h3 class="text-[11px] uppercase tracking-wide text-slate-500 mb-1.5">Payment</h3>
  <p class="text-[10px] text-slate-600 mb-1">How the bill is handled</p>
  <div class="flex flex-col gap-1.5">
    ...
  </div>
</div>
```

After:
```vue
<div>
  <h3 class="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5" title="How the bill is handled">Payment</h3>
  <div class="flex flex-col gap-1.5">
    ...
  </div>
</div>
```

### 2. Normalise Refine section header colors

`pages/index.vue` Refine section labels mix `text-slate-400` (Price, With, Cuisine) with `text-slate-500` (Service, Ordering, Payment). Same visual role.

Change the three 3-column-grid `<h3>` labels from `text-slate-500` → `text-slate-400` for parity. This should be a quick find-and-replace within the Service/Ordering/Payment grid.

### 3. Smoother page transitions (forward + back)

The current `page-enter-active` / `page-leave-active` uses a fixed 0.25s with a 20px X-translation in both directions. With `mode: 'out-in'` total perceived time is 500ms — feels sluggish.

Replace in `assets/css/main.css`:

```css
.page-enter-active {
  transition: opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}
.page-leave-active {
  transition: opacity 0.18s cubic-bezier(0.4, 0, 1, 1),
              transform 0.18s cubic-bezier(0.4, 0, 1, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translate3d(16px, 0, 0);
}
.page-leave-to {
  opacity: 0;
  transform: translate3d(-12px, 0, 0);
}
```

(Keep the existing `prefers-reduced-motion` override — it still wins.)

### 4. Refine panel: animate the open/close

Currently `v-if="filtersOpen"` pops the panel in/out with zero animation. Wrap it in a `<Transition>` with a grid-rows height trick:

```vue
<Transition name="collapse">
  <div v-if="filtersOpen" id="refine-panel" class="mt-3 space-y-4 pb-2">
    ... existing content ...
  </div>
</Transition>
```

Add to `assets/css/main.css`:

```css
.collapse-enter-active,
.collapse-leave-active {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.22s ease-out, opacity 0.22s ease-out;
}
.collapse-enter-from,
.collapse-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}
.collapse-enter-active > *,
.collapse-leave-active > * {
  overflow: hidden;
  min-height: 0;
}
```

Also rotate the chevron icon instead of swapping it. In `pages/index.vue` the Refine trigger button:
- Use ONE icon (`i-heroicons-chevron-down`) and add `transition-transform duration-200`.
- Toggle a class: `:class="filtersOpen && 'rotate-180'"`.

### 5. Re-roll: clean two-phase swap

The current re-roll has a jank — opacity drops to 50% and then text content swaps under it (you see the new name appear behind a dimmed card).

In `pages/result.vue`, replace the inner card with a keyed `<Transition mode="out-in">`:

```vue
<Transition name="reroll" mode="out-in">
  <div
    v-if="restaurant"
    :key="restaurant.id"
    class="rounded-2xl bg-slate-800 border border-slate-700 p-5 shadow-2xl shadow-orange-500/15"
  >
    ... card body ...
  </div>
</Transition>
```

Drop the existing `rerolling` ref / opacity-50 class logic. Move spin to the Re-roll button's icon:

```vue
<UIcon
  name="i-heroicons-arrow-path"
  class="w-5 h-5 transition-transform duration-300"
  :class="rerolling && 'rotate-180'"
  aria-hidden="true"
/>
```

Add to `main.css`:

```css
.reroll-enter-active { transition: opacity 0.22s ease-out, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1); }
.reroll-leave-active { transition: opacity 0.14s ease-in, transform 0.14s ease-in; }
.reroll-enter-from { opacity: 0; transform: translateY(8px) scale(0.98); }
.reroll-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }
```

Keep `rerolling` ref only to drive the icon spin (set true on click, false after ~300ms).

### 6. First-load skeleton instead of "All restaurants are hidden"

Cold load currently flashes the "All restaurants are hidden" empty state before `store.load()` resolves, because `visible.length === 0` initially.

In `pages/index.vue`:
- Change the `v-if="noVisible"` (or equivalent) computed to gate on `store.loaded`:
  ```ts
  const noVisible = computed(() => store.loaded && store.visible.length === 0)
  ```
- Add an `else` branch for `!store.loaded` that renders a simple skeleton: header in place + a dim placeholder grid (4 area cards with `bg-slate-800/50 animate-pulse h-24`).

Same gating on `pages/manage.vue`: don't render "No restaurants found" empty state until `store.loaded`.

### 7. Returning users see filters are active

When filters persist across sessions, returning users land on a collapsed Refine panel — they have to read the small grey summary to know filters are on.

In `pages/index.vue`:
```ts
const filtersOpen = ref(store.hasActiveFilters)
```
(Replaces current `ref(false)`.)

This means returning users with active filters land on an OPEN Refine panel and immediately see what's filtering.

---

## P1 — Important (should do)

### 8. Bottom nav indicator slides instead of teleporting

Currently the orange indicator bar is `v-if`'d per link — teleports when tab changes. Use a CSS transform instead.

In `layouts/default.vue`:

```vue
<span
  aria-hidden="true"
  class="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-orange-400 origin-center transition-transform duration-200"
  :class="route.path === '/' ? 'scale-x-100' : 'scale-x-0'"
/>
```

Render unconditionally (drop the `v-if`), animate `scale-x` between 0 and 1. Same on the Manage link with `route.path === '/manage'`. Each link still owns its own indicator — they just scale in/out rather than appear/disappear.

### 9. Active filter chips/buttons: `active:scale-95`

The filter buttons today only animate color via `transition-all`. Press feels flat. Add `active:scale-95` to every filter button across all 6 rows (Price, With, Service, Ordering, Payment, Cuisine).

Find every `class="... transition-all"` button in `pages/index.vue` filter rows and append `active:scale-95`.

### 10. Manage filter tab + search list — animated swap

When filter tab (All / Active / Hidden) changes or search filters the list, cards pop in/out instantly. Wrap the area-grouped restaurant lists in `<TransitionGroup>`.

In `pages/manage.vue` around the `<article v-for="restaurant ...">` blocks:

```vue
<TransitionGroup name="list" tag="div" class="space-y-3 pt-3">
  <article v-for="restaurant in group.items" :key="restaurant.id" ...>
    ...
  </article>
</TransitionGroup>
```

Add to `main.css`:

```css
.list-enter-active,
.list-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.list-leave-active { position: absolute; width: calc(100% - 2rem); }
.list-enter-from,
.list-leave-to { opacity: 0; transform: translateY(6px); }
.list-move { transition: transform 0.22s ease; }
```

### 11. Empty/clear-filters branch fade

When filters narrow to 0 places, the location grid replaces with the "Clear filters" UI abruptly.

In `pages/index.vue`, wrap the two mutually-exclusive branches in a `<Transition name="fade" mode="out-in">`:

```vue
<Transition name="fade" mode="out-in">
  <div v-if="totalAvailable === 0 && store.hasActiveFilters" :key="'empty'">
    ... clear filters UI ...
  </div>
  <div v-else-if="..." :key="'all-hidden'">
    ... all hidden UI ...
  </div>
  <div v-else :key="'grid'">
    ... location grid ...
  </div>
</Transition>
```

Add:
```css
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(4px); }
```

### 12. IosInstallHint dismissal — animated collapse

When dismissed, the banner currently disappears instantly, causing the orange CTA to jump up.

In `components/IosInstallHint.vue`, wrap the banner in `<Transition name="collapse">` (using the same collapse class from item 4).

### 13. Smooth scroll + global polish

Add to `assets/css/main.css`:

```css
html {
  scroll-behavior: smooth;
  -webkit-tap-highlight-color: transparent;
}
body {
  overscroll-behavior-y: contain;
}
```

This kills the grey iOS tap flash and contains rubber-band scrolling at page edges.

### 14. Scope chip on Result — fade on change

When user taps Re-roll and the scope chip updates (e.g. badges added/removed), it currently swaps instantly. Wrap in `<Transition name="fade">`:

```vue
<Transition name="fade">
  <div v-if="scopeChip" :key="scopeChip" class="px-4 mb-3">
    ... scope chip ...
  </div>
</Transition>
```

### 15. Result card scope chip should reuse home summary

The result page scope chip should match the home filterSummary verbatim for consistency. Extract a shared computation:

Add a getter `filterSummary` to `stores/restaurants.ts` that returns the same string the home page computes. Have both home and result pages consume it. This ensures they never diverge.

### 16. AppHeader extraction (optional but recommended)

The three pages have three different header treatments. Extract `components/AppHeader.vue` with slots `default` (title), `left` (back button), `right` (action), and a `sticky?: boolean` prop. Use it on all three pages. Standardize on:
- `text-2xl font-bold tracking-tight` titles
- `pt-[max(2rem,env(safe-area-inset-top))] pb-4`

If the refactor feels too invasive in this pass, document it for v4 and just normalize the three existing headers to use those exact padding and title-size values.

---

## P2 — Polish

### 17. Card padding parity

Confirm consistency: result card `p-5`, manage cards `p-4`, area cards `p-4`. Result is the hero so `p-5` is intentional. No change needed unless visually off.

### 18. Gap rhythm on result page

In `pages/result.vue`:
- Context badges row (around line 67) uses `gap-1.5` — change to `gap-2` to match cuisine chips above.
- Tags row uses `gap-1.5` — change to `gap-2` to match meal badges.

### 19. Dice tilt on Surprise Me press

Tiny micro-interaction. In `pages/index.vue` Surprise Me button:

```vue
<button class="... group ..." ...>
  <span class="inline-flex items-center gap-2">
    <span class="text-2xl transition-transform duration-150 group-active:rotate-12">🎲</span>
    <span>Surprise Me</span>
  </span>
</button>
```

### 20. Disabled area card — say WHY

When `area.count === 0 && store.hasActiveFilters`, the disabled card just reads "0 places" with reduced opacity. Add a secondary line below the count: `Doesn't match filters` in `text-[10px] text-slate-500`.

### 21. Recent badge auto-update on Manage

`pages/manage.vue` reads `allVisits` only `onMounted`. After Let's Go, the badge doesn't update without remount. If easy, expose `allVisits` as a ref from `useVisitHistory()` and have Manage subscribe to it. Otherwise document as v4.

---

## Future ideas (DO NOT implement now)

- AppHeader component refactor (mentioned in P1 #16 but only as polish unless time permits).
- Shared `<Chip>` component to replace ~10 ad-hoc chip styles.
- Toast notification on Let's Go ("Marked X as visited" with undo).
- One shared indicator bar in bottom nav that translates between tabs (today's design uses two scale-x'd bars which is fine).

---

## Acceptance criteria

After implementation:

1. `npm run build` passes with zero errors.
2. The Service/Ordering/Payment 3-column grid is perfectly aligned (no Payment-column buttons lower than the others).
3. All Refine `<h3>` labels have the same color (`text-slate-400`).
4. Page transitions use the new asymmetric cubic-bezier curves.
5. Refine panel animates open/close with the grid-rows trick (no v-if pop).
6. Refine chevron rotates 180° instead of swapping icons.
7. Re-roll card transition uses `<Transition mode="out-in">` keyed on `restaurant.id`.
8. Re-roll dice/arrow icon spins on click.
9. First-load no longer flashes "All restaurants are hidden" — uses skeleton until `store.loaded`.
10. Returning users with active filters see the Refine panel open by default.
11. Bottom nav indicator slides between tabs via `scale-x` transition.
12. Every filter button has `active:scale-95`.
13. Manage list uses `<TransitionGroup>` for smooth filter/search updates.
14. Empty/clear-filters branch uses fade transition.
15. IosInstallHint dismissal animates.
16. `scroll-behavior: smooth` and `-webkit-tap-highlight-color: transparent` set globally.
17. Scope chip on result page reuses the home filterSummary logic (no duplication).
