# All-Ages Mobile Redesign Spec

Designer pass focused on making LunchSpin friendly for users 25–65+ with mixed phone literacy. Implement P0 and P1. P2 is polish.

After implementation, run `npm run build` and verify nothing regressed.

---

## Top 5 high-impact changes (do these FIRST)

1. Bump every `text-xs` / `text-[10-11px]` body string to `text-sm` (14px); promote section headings from `text-[11px] uppercase` to `text-sm font-semibold` mixed-case.
2. Hero CTA always shows a one-line subtitle ("Picks one place at random"); rewrite area-grid header.
3. Add a one-time dismissible onboarding card at top of Home (3 bullets).
4. Bigger tap targets: chips `min-h-[48px]`; back arrow becomes labeled "← Back" button.
5. Replace tiny "Try anywhere instead →" link with a full-width tertiary button: "Pick from anywhere in Singapore".

---

## P0 — Must do

### Body type minimum 14px
- **Where:** `pages/index.vue`, `pages/result.vue`, `pages/manage.vue`, `components/IosInstallHint.vue` — any `text-[11px]`, `text-[10px]`, or `text-xs` used on important content.
- **Fix:**
  - `text-[11px]` → `text-sm`
  - `text-[10px]` → `text-xs` (only where genuinely tertiary)
  - `text-xs` on important content (filter summary, area count, "Recent" badge, IOS hint copy) → `text-sm`
  - Convert ALL CAPS section headers to mixed case: `<h3 class="text-sm font-semibold text-slate-200 mb-2">Price</h3>` (was `text-[11px] uppercase tracking-wide text-slate-400 mb-1.5`)
- Apply to all 6 Refine section labels (Price, With, Service, Ordering, Payment, Cuisine).

### Hero CTA always has a sub-label
- **Where:** `pages/index.vue` lines 51–71.
- **Fix:** Below the button text add a subtitle:
  ```vue
  <span class="block text-sm font-normal text-orange-100/90 mt-1">{{ ctaSubtitle }}</span>
  ```
  - Default state: `Picks one place at random`
  - Area state: `Picks one place from these`
  - Active-filter state: `Picks one place that matches your filters`

### Onboarding card (first-visit only)
- **Where:** New `components/FirstRunHints.vue`, mounted in `pages/index.vue` directly above the hero CTA (and above `<IosInstallHint />`).
- **Behaviour:**
  - Show only when `!localStorage.getItem('lunchspin:onboarded_v1')`.
  - Three bullet rows with icons (lightbulb, map-pin, list-bullet):
    1. "Tap the orange button — we pick a place for you"
    2. "Or tap area cards to choose from specific malls"
    3. "Use My Places to hide places you don't like"
  - "Got it" button at bottom: `min-h-[48px] bg-orange-500 text-white rounded-2xl`, on tap writes the localStorage key and hides.
- **Visual:** Match `IosInstallHint` style (slate-800 background, slate-700 border, padded inside).

### Bigger, labeled back button on Result
- **Where:** `pages/result.vue` lines 5–11.
- **Fix:**
  ```vue
  <NuxtLink
    to="/"
    class="inline-flex items-center gap-2 h-12 px-4 rounded-full bg-slate-800 border border-slate-700 active:scale-95"
    aria-label="Back"
  >
    <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 text-slate-200" aria-hidden="true" />
    <span class="text-base font-medium">Back</span>
  </NuxtLink>
  ```

### Re-roll: explicit label and stronger affordance
- **Where:** `pages/result.vue` lines 172–183.
- **Fix:** Change copy from `Re-roll` to `Try a different place`. Bump padding to `py-4` and font to `text-lg` to visually pair-weight with Let's Go.

### "Try anywhere instead" promoted to full button
- **Where:** `pages/result.vue` lines 184–190.
- **Fix:** Replace the tiny link with a full-width tertiary button:
  ```vue
  <button
    v-if="hasAreaScope"
    class="w-full py-3 rounded-2xl text-base font-medium text-slate-300 bg-transparent border border-slate-700 active:scale-95"
    @click="onTryAnywhere"
  >
    Pick from anywhere in Singapore
  </button>
  ```

### Area cards: clearer multi-select cue
- **Where:** `pages/index.vue` area grid section (~line 331+).
- **Fix:**
  - Replace area-grid header `<p>Tap to pick one or more:</p>` with:
    ```vue
    <p class="text-base text-slate-200 mb-3">
      Or pick specific places
      <span class="text-slate-400">(tap as many as you like)</span>
    </p>
    ```
  - Enlarge the selection check icon: `w-6 h-6` (was `w-5 h-5`), styled as `text-white bg-orange-500 rounded-full p-0.5` so the checkmark sits inside an orange circle.
  - Strengthen selected ring from `ring-2 ring-orange-500` to `ring-4 ring-orange-500`.

### "Clear (N selected)" → fuller phrasing
- **Where:** `pages/index.vue` lines 73–80.
- **Fix:**
  ```vue
  <button
    class="text-sm text-slate-300 underline-offset-2 hover:underline px-3 py-2 min-h-[44px]"
    @click="store.clearAreaSelection"
  >
    Clear {{ store.selectedAreas.length }} selected
  </button>
  ```
  (Drop the parentheses; tap target lifted; text size up.)

---

## P1 — Should do

### Filter section helper text
- **Where:** `pages/index.vue` Refine panel.
- **Fix:**
  - Under "Ordering" `<h3>`, add `<p class="text-xs text-slate-400 mb-2">Own dish each, or share dishes family-style</p>`
  - Under "Payment" `<h3>`, add `<p class="text-xs text-slate-400 mb-2">Split the bill, or one person pays</p>`
- Rename chip labels in `pages/index.vue`:
  - `Shared (叫料吃)` → `Share dishes` (drop the Chinese gloss — already explained in helper text)
  - `Split` → `Everyone pays own`
  - `Treat` → `One pays`
  (Update both UI labels AND the WITH/SERVICE/etc. LABEL_MAP entries in `stores/restaurants.ts` so filterSummary stays consistent.)

### Refine toggle row stronger affordance
- **Where:** `pages/index.vue` Refine trigger button (~line 128).
- **Fix:** Promote from `text-sm text-slate-300` to `text-base text-white font-medium`. Wrap in a card-like surface: `bg-slate-900 border border-slate-800 rounded-2xl px-4`. Subtitle changes from "Refine" to **"Refine my pick"**.

### "Manage" → "My Places"
- **Where:** `layouts/default.vue` bottom-nav label, `pages/manage.vue` H1.
- **Fix:**
  - Bottom nav: `Manage` → `My Places`
  - H1: `Manage` → `My Places`
  - Subtitle: `Toggle restaurants on/off` → `Hide places you don't want to see`

### Toggle switch with ON/OFF text
- **Where:** `pages/manage.vue` per-restaurant toggle.
- **Fix:** Add a status word before each switch:
  ```vue
  <span class="text-xs font-semibold text-slate-300 mr-2">
    {{ isActive(restaurant.id) ? 'Showing' : 'Hidden' }}
  </span>
  ```
  Increase switch dimensions: `h-7 w-12` (was `h-6 w-11`) with `h-5 w-5` knob.

### Result page meta combined into a single pill
- **Where:** `pages/result.vue` "Avoiding N recent" + "Only 1 match" paragraphs.
- **Fix:** Combine into ONE `text-sm` line styled as a pill above the card:
  ```vue
  <div v-if="metaLine" class="px-4 mb-3">
    <span class="inline-block bg-slate-800/60 border border-slate-700 rounded-full px-3 py-1 text-sm text-slate-300">
      {{ metaLine }}
    </span>
  </div>
  ```
  `metaLine` is a computed combining both signals.

### Empty-state "Open Manage" button enlarged
- **Where:** `pages/index.vue` lines 39–45.
- **Fix:** `py-4 px-6 text-base w-full max-w-xs` (was `py-2.5 px-5 text-sm`).

### iOS install hint copy
- **Where:** `components/IosInstallHint.vue`.
- **Fix:** Copy → "Add LunchSpin to your home screen: tap the Share icon (square with up-arrow) at the bottom, then 'Add to Home Screen'."

---

## P2 — Nice to have

### Color-blind safe selected state
- **Where:** all filter chips (Price, With, Cuisine, Area).
- **Fix:** Add a checkmark icon inside the selected chip:
  ```vue
  <UIcon v-if="isSelected" name="i-heroicons-check" class="w-4 h-4 mr-1" aria-hidden="true" />
  ```
  Shape, not just hue, signals state.

### Spacing loosen
- `gap-1.5` → `gap-2`
- `gap-2` on chip rows → `gap-3`
- `mt-3` between sections → `mt-4`

### "Saved" toast styled as pill
- **Where:** `pages/result.vue` inlineMessage success state.
- **Fix:** Wrap in `bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-2 rounded-full inline-flex items-center gap-2` with check icon.

---

## Microcopy rewrites (canonical list)

| Where | Current | New |
|---|---|---|
| Hero CTA default | Surprise Me 🎲 | Surprise Me 🎲 (+ subtitle "Picks one place at random") |
| Hero CTA filters | Pick for me | Pick one for me (+ subtitle "Matches your filters") |
| Hero CTA areas | Pick from {areas} | Pick one from {areas} |
| Refine label | Refine | Refine my pick |
| Area grid header | Tap to pick one or more: | Or pick specific places (tap as many as you like) |
| Clear selection | Clear (N selected) | Clear N selected |
| Let's Go | Let's Go! 🚀 | Let's Go! 🚀 (+ optional subtitle "Opens Google Maps") |
| Re-roll | Re-roll | Try a different place |
| Try anywhere | Try anywhere instead → | Pick from anywhere in Singapore |
| Bottom nav | Manage | My Places |
| Manage H1 | Manage | My Places |
| Manage subtitle | Toggle restaurants on/off | Hide places you don't want to see |
| Ordering chip | Shared (叫料吃) | Share dishes |
| Payment chips | Split / Treat | Everyone pays own / One pays |
| Offline banner | You're offline — using cached data | You're offline. The app still works with saved info. |

---

## What we should NOT change

- Orange-on-dark color scheme (already accessible)
- Bottom-nav with icons + labels
- Single hero CTA above the fold
- `prefers-reduced-motion` handling
- Skeleton loaders + empty state patterns
- Multi-area selection mechanic (the design itself works; just clarify with copy + visual cues)

---

## Acceptance criteria

After implementation:

1. `npm run build` passes.
2. No `text-[10px]` or `text-[11px]` remain in `pages/` and `components/`.
3. Section labels in Refine panel are mixed-case `<h3>` at `text-sm`.
4. Hero CTA has a visible subtitle in all 3 states.
5. `FirstRunHints.vue` component exists and is mounted in `pages/index.vue`.
6. First visit shows the onboarding card; tapping "Got it" hides it forever (localStorage `lunchspin:onboarded_v1`).
7. Result page back button shows both arrow + "Back" text.
8. Re-roll button text reads "Try a different place".
9. "Try anywhere" is a full-width button reading "Pick from anywhere in Singapore".
10. Area cards show `ring-4` when selected.
11. Bottom-nav and Manage page show "My Places" (not "Manage").
12. Manage toggle shows "Showing" or "Hidden" word next to each switch.
13. Filter chip labels: "Share dishes", "Everyone pays own", "One pays".
14. Helper paragraphs under Ordering and Payment sections.
15. iOS install hint copy updated to explain the Share icon.
