# LunchSpin Feature Spec — 4 New Filter Dimensions

Adds context-aware filtering so the app helps for different real-life occasions: solo vs date vs colleague vs family, dine-in vs takeaway, individual vs shared ordering (叫料吃), split bill vs treating.

Implement the schema, data tagging, store, UI, and behaviour exactly as below.

---

## 1. Data schema

Add these REQUIRED fields to the `Restaurant` interface in `stores/restaurants.ts`:

```ts
service: ('dine-in' | 'takeaway')[]
ordering_style: 'individual' | 'shared' | 'both'
suitable_for: ('solo' | 'date' | 'colleague' | 'family')[]
pay_style: 'split' | 'treat' | 'either'
```

All four required (no `?:`). Every restaurant in `public/data/restaurants.json` must have all four populated.

---

## 2. Data migration — tag all 202 restaurants

Write a one-off Node script (place in `/tmp/tag-restaurants.mjs`) that reads `public/data/restaurants.json`, applies the archetype rules below in order (first match wins), applies overrides, cleans the `tags` array, and writes back. Commit the result. Delete the script after.

### Archetype rules (apply in order, first match wins)

| Order | Archetype | Match heuristic | service | ordering_style | suitable_for | pay_style |
|---|---|---|---|---|---|---|
| 1 | **Hawker / food court** | `cuisine` includes `Hawker`; or name contains "Food Court / Junction / Republic / Kopitiam / Koufu / Food Place / Food Opera" | `[dine-in, takeaway]` | `individual` | `[solo, colleague, family]` | `split` |
| 2 | **Hotpot / BBQ / shabu / buffet** | Name contains: Hai Di Lao, Shaburi, Beauty In The Pot, Seoul Garden, Seorae, Paradise Hotpot, Wang Lu Hotpot, JiangHu Hotpot, Shoo Loong Kan, Shabu Sai, Yakiniku, Hotpot, BBQ, Shabu, Buffet | `[dine-in]` | `shared` | `[date, colleague, family]` | `either` |
| 3 | **Premium / steakhouse / wine bar** | Name contains: iSTEAKS, Steak 99, Casa Vostra, Wine Connection, Brotzeit, Paradise Dynasty; or (`price_range >= 3` AND cuisine includes Western OR Italian) | `[dine-in]` | `both` | `[date, family]` | `treat` |
| 4 | **Fast food chain** | Name matches: McDonald's, KFC, Burger King, Subway, Popeyes, Long John Silver's, Yoshinoya, Sukiya, Sukiya Gyudon, MOS Burger, Texas Chicken, 4Fingers, 4FINGERS, Jollibee | `[dine-in, takeaway]` | `individual` | `[solo, colleague, family]` | `split` |
| 5 | **Ramen / donburi / katsu / pepper-lunch style** | Name contains: Ramen, Kanada-Ya, Ippudo, Menya, Tonkotsu, Aburi, "EN-biton", Donburi, Katsu, Tonkatsu, Pepper Lunch, Gyudon, Eat 3 Bowls, Ajisen, Takagi, Suparakki, Kazan, Next Shikaku | `[dine-in, takeaway]` | `individual` | `[solo, date, colleague]` | `split` |
| 6 | **Chinese sit-down sharing** | Name contains: Dian Xiao Er, Putien, Crystal Jade, Soup Restaurant, Tsui Wah, Canton Paradise, Lao Huo Tang, Honolulu Cafe, Xin Wang, Yun Nans, Xiang Xiang Hunan, A One Signature, A-One Signature, A-One Claypot, Din Tai Fung, Song Fa, Lau Wang Claypot, Tan Yu, Swee Choon, DaXi, Wok Hey, Wong, Jia Li, First Bowl, Qi Le, Yew Kee, Fa Ji, Chao Yue, Wang Ji Dim Sum, Gong Yuan, Zhang Liang, Chicken Ka Kee, Ah Ma, The Dim Sum Place | `[dine-in, takeaway]` | `shared` | `[date, colleague, family]` | `either` |
| 7 | **Casual Western / pasta / pizza** | Name contains: PastaMania, Pizzakaya, Saizeriya, Pezzo, Eat Pizza, Big Pasta, Hot Tomato, Swensen's, Fish & Co, Manhattan Fish, Poulet, Twyst, Collin's, Hot Tomato, Souperstar, The Soup Spoon, Tenderfresh, Kenny Rogers, BBQ Express, Poke Theory | `[dine-in, takeaway]` | `individual` | `[solo, date, colleague, family]` | `split` |
| 8 | **Conveyor / casual sushi** | Name matches: Sushiro, Sushi Express, Genki Sushi, Sakae Sushi, umisushi, Umisushi, Maki-San | `[dine-in, takeaway]` | `individual` | `[solo, date, colleague, family]` | `split` |
| 9 | **Sit-down Japanese (non-ramen)** | Name contains: Sushi Tei, Yakiniku Like, Kei Kaisendon, Kuriya, Ichiban Boshi, Tokyo Shokudo, Sen Sen Sushi, Yayoi, Gochi-So, Kazo, TORI-Q, Tori Story, NiKU iKU, Super Sushi, Teppan, Maki | `[dine-in, takeaway]` | `individual` | `[solo, date, colleague]` | `split` |
| 10 | **Thai (casual)** | `cuisine` includes `Thai` | `[dine-in, takeaway]` | `shared` | `[date, colleague, family]` | `split` |
| 11 | **Korean (casual, non-BBQ)** | `cuisine` includes `Korean` AND not already matched by hotpot/BBQ rule | `[dine-in, takeaway]` | `both` | `[solo, date, colleague]` | `split` |
| 12 | **Indian** | `cuisine` includes `Indian` | `[dine-in, takeaway]` | `individual` | `[solo, family]` | `split` |
| 13 | **Malay / Indonesian** | `cuisine` includes `Malay` | `[dine-in, takeaway]` | `individual` | `[solo, colleague, family]` | `split` |
| 14 | **Vietnamese** | `cuisine` includes `Vietnamese` | `[dine-in, takeaway]` | `individual` | `[solo, colleague, family]` | `split` |
| 15 | **Cafe / fusion** | `cuisine` includes `Cafe`; or name contains "Cafe"; or name = Miam Miam | `[dine-in, takeaway]` | `individual` | `[solo, date]` | `split` |
| 16 | **Burger / wraps / quick** | Name matches: Shake Shack, SIMPLEburger, Stuff'd, Wingstop, Tipsy Bunny | `[dine-in, takeaway]` | `individual` | `[solo, colleague]` | `split` |
| 17 | **Fallback** | anything unmatched | `[dine-in, takeaway]` | `individual` | `[solo, colleague]` | `split` |

### Specific overrides (apply AFTER archetype rules)

Match by exact restaurant `name` (or `id` if name is ambiguous):

| Name | Override |
|---|---|
| Shaburi & Kintan Buffet | `service: [dine-in]` |
| Beauty In The Pot | `pay_style: treat` |
| Seorae Korean Charcoal BBQ | `pay_style: treat` |
| iSTEAKS Diner | `suitable_for: [date, colleague, family]` |
| Casa Vostra | `pay_style: treat`, `service: [dine-in]` |
| Wine Connection | `service: [dine-in]`, `ordering_style: shared`, `suitable_for: [date, colleague]` |
| Brotzeit | `service: [dine-in]`, `ordering_style: shared`, `suitable_for: [date, colleague]` |
| Tipsy Bunny | `service: [dine-in]`, `suitable_for: [date, colleague]`, `pay_style: either` |
| Miam Miam | `suitable_for: [solo, date, family]` |
| Din Tai Fung | `pay_style: either` |
| Song Fa Bak Kut Teh | `ordering_style: individual` |
| Saizeriya | `pay_style: split`, `suitable_for: [solo, date, colleague, family]` |
| Shake Shack | `suitable_for: [solo, date, colleague, family]` |

### `tags` cleanup

In the same migration script, for every restaurant:
- **Remove** tag values: `solo`, `with-gf`, `group` (now expressed via `suitable_for`).
- **Keep** tag values: `quick`, `leisure`, `supper`, `iconic`, `hawker`, `restaurant`, `cafe`, `fast-food`.

Add a runtime assertion in `stores/restaurants.ts` `load()` that throws (in development) if any restaurant still has `solo`, `with-gf`, or `group` in `tags`.

---

## 3. Pinia store state + actions

Add to `RestaurantsState`:

```ts
serviceFilters: ('dine-in' | 'takeaway')[]      // default ['dine-in', 'takeaway']
withFilters: ('solo' | 'date' | 'colleague' | 'family')[]  // default []
orderingFilters: ('individual' | 'shared')[]    // default []
payFilters: ('split' | 'treat')[]               // default []
```

Initial state: `serviceFilters: ['dine-in', 'takeaway']`, others empty.

Add actions:
- `toggleServiceFilter(s)` — must enforce non-empty (refuse toggle if would leave empty).
- `toggleWithFilter(w)`, `toggleOrderingFilter(o)`, `togglePayFilter(p)` — empty allowed.
- Extend `clearFilters()` to reset all four (service back to `['dine-in', 'takeaway']`, others to `[]`).

Update `hasActiveFilters` getter:
- True if `priceFilters.length > 0` OR `cuisineFilters.length > 0` OR `withFilters.length > 0` OR `orderingFilters.length > 0` OR `payFilters.length > 0` OR `serviceFilters.length !== 2` (i.e. not the default-both state).

Update `availableNow` getter to apply ALL new filters:

```ts
// service: restaurant must offer at least one of the user-selected services
if (!r.service.some(s => serviceFilters.includes(s))) return false

// with: if user selected any, restaurant must support at least one of them
if (withFilters.length > 0 && !r.suitable_for.some(w => withFilters.includes(w))) return false

// ordering: 'both' on restaurant matches any filter; else direct match
if (orderingFilters.length > 0) {
  const matches = r.ordering_style === 'both' || orderingFilters.includes(r.ordering_style)
  if (!matches) return false
}

// pay: 'either' on restaurant matches any filter; else direct match
if (payFilters.length > 0) {
  const matches = r.pay_style === 'either' || payFilters.includes(r.pay_style)
  if (!matches) return false
}
```

---

## 4. UI: Refine panel layout

In `pages/index.vue`, the Refine section sections (top-to-bottom):

```
Price                            (existing — keep)
With                             (new — chip cloud)
Service                          (new — 2 wide buttons, default both)
Ordering                         (new — 2 wide buttons)
Payment                          (new — 2 wide buttons)
Cuisine                          (existing — keep last)
```

Move Cuisine to the bottom of the panel (it's currently above Price — adjust).

### Section styling — match existing patterns

**Section label** (reuse):
```html
<p class="text-xs uppercase tracking-wide text-slate-400 mb-2">LABEL</p>
```

**With** — chip cloud, 4 chips:
```html
<div class="flex flex-wrap gap-2">
  <button
    v-for="opt in withOptions"
    :key="opt.value"
    class="px-3 py-2 rounded-full text-xs font-medium border transition-all"
    :class="store.withFilters.includes(opt.value)
      ? 'bg-orange-500 border-orange-500 text-white'
      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'"
    @click="store.toggleWithFilter(opt.value)"
  >{{ opt.label }}</button>
</div>
```
Options: `Solo`, `Date`, `Colleague`, `Family` (labels), values: `solo`, `date`, `colleague`, `family`.

**Service / Ordering / Payment** — 2 wide buttons each:
```html
<div class="flex gap-2">
  <button class="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all" :class="...">A</button>
  <button class="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all" :class="...">B</button>
</div>
```

Specific labels:
- Service: `Dine-in` / `Takeaway`
- Ordering: `Individual` / `Shared (叫料吃)`
- Payment: `Split` / `Treat`

### Collapsed-state summary line

Update the existing summary line under the "Refine" chevron to include the new filters when active. Order: price → with → service → ordering → payment → cuisine.

Example (all on): `$/$$ · Solo/Date · Dine-in · Shared · Split · Japanese, Thai`

Rules:
- Skip any section that's at default (Service = both, others = empty).
- Multi-select within a section joined `/`.
- Multi-cuisine joined `, `.
- One line, truncate with the existing `truncate` class if it overflows.

### Active filter count badge

Update `activeFilterCount` computed (or equivalent) to include the new filters. Don't count Service unless it's NOT the default-both state.

---

## 5. Behaviour & edge cases

- Service: at least one must be selected. `toggleServiceFilter` refuses to remove the last one (mirror existing price-filter pattern).
- With / Ordering / Payment: empty = "no filter" (matches existing cuisine semantics).
- "Clear all filters" button resets all new filters AND price/cuisine. Service back to `['dine-in', 'takeaway']`, others to `[]`.

---

## 6. Acceptance criteria

After implementation:

1. `npm run build` passes with zero errors.
2. Every restaurant in `restaurants.json` has all 4 new fields populated.
3. No restaurant has `solo`, `with-gf`, or `group` in its `tags` array.
4. Home page Refine section shows 6 filter sections in the order above.
5. Tapping a "With" chip (e.g. Date) reduces the location card counts to only places where `suitable_for` includes `date`.
6. Tapping "Takeaway" off (leaving only Dine-in) filters out takeaway-only places.
7. Tapping "Dine-in" off when Takeaway is also off is REJECTED (no change to state).
8. Tapping "Shared" filters to restaurants where `ordering_style` is `shared` OR `both`.
9. Tapping "Treat" filters to restaurants where `pay_style` is `treat` OR `either`.
10. "Clear all filters" resets everything back to defaults.
11. Collapsed Refine shows a summary line of active filters.
12. Filter count badge "N active" correctly counts the new dimensions (Service default counts as 0).
