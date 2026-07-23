# LunchSpin Data Audit — Google Maps, all 7 malls

Audited **all 262 entries** in `public/data/restaurants.json` against Google Maps on 2026-07-22.

> **STATUS — applied 2026-07-22 / 23.** Applied to `public/data/restaurants.json`, now **234 entries** (backup: original 262 at `scripts/.cache/restaurants.backup.json`):
> - **Sections 1 + 2** — 27 removed (13 Google-confirmed closed, 14 absence-verified).
> - **Section 4** — Canton Paradise (Westgate) removed after a fresh re-check confirmed only the JEM outlet exists (viewport-correct: neighbouring Westgate tenants resolved). The other two wrong-mall cases (Burger King @ Northpoint, McDonald's @ Lot One) are **kept** — they sit at the mall's doorstep and group correctly by area.
> - **Section 6** — 5 substantive rebrands applied, kept in clean-name style: Ajisen Tanjiro→Ajisen Ramen, A-One Claypot House→A-One Signature, Seorae Korean Charcoal BBQ→Seorae Jib (×2), Wang Ji Dim Sum→Wang Fu Dim Sum. Cosmetic renames (romanization / collab / mall-suffix noise) were **skipped** to keep display names clean.
> - **Section 5** — 85 Redhill & Jian Bo re-checked, still unresolved (food-court/kiosk stalls, often no distinct Maps pin). **Kept** — absence of a pin is not evidence of closure.
> - **NOT applied — field backfill.** `open_days` is not derivable from the captured data (snapshots are single-moment open/closed status taken during off-hours, not weekly schedules). `service` diffs (38) are low-confidence and cut both ways vs the intentional archetype model; auto-applying risks degrading it. A proper `open_days` pass would need ~230 fresh per-place hours-panel lookups — offered separately, not done here.
> - Also fixed: dropped a stale deprecated `group` tag from Sichuan Chef and Eighteen Plum, which had been throwing in the dev-only validator and hanging `npm run dev`.

## Method

Each entry was searched as `<name> <mall>` on Google Maps. Three outcomes:

- Google resolves to a **place page** → alive; unit number, hours, price band and service options captured.
- Google shows a **result list** → no confident match at that mall. Re-queried with `<name> <area>` before being reported.
- Place page carries a **"Permanently closed"** banner → closed, stated by Google itself.

Every uncertain case got a second query with different phrasing. That reversed 4 of them — see *Cleared on re-check*.

## 1. Confirmed permanently closed — 13

Google explicitly marks these "Permanently closed". Highest confidence in the report.

| Mall | Entry | Unit | Note |
|---|---|---|---|
| AMK Hub | **Tokyo Shokudo** | `53 AMK Ave 3, #02-19/20/21` |  |
| JEM | **Kanada-Ya Ramen** | `50 Jurong Gateway Rd, #03-09` |  |
| JEM | **Shaburi & Kintan Buffet** | `50 Jurong Gateway Rd, #03-11/12` |  |
| JEM | **SIMPLEburger Inc** | `#01-08/09` |  |
| JEM | **Kenny Rogers Roasters** | `#B1-37/38` |  |
| JEM | **Tipsy Bunny** | `#01-05` |  |
| JEM | **Marché Mövenpick** | `#01-03` |  |
| JEM | **Monga Fried Chicken** | `#B1-K10` |  |
| Lot One | **Tori Story** | `21 CCK Ave 4, B1-K2` |  |
| Westgate | **Yun Nans** | `#03-07` |  |
| Westgate | **Long John Silver's** | `—` | Permanently closed at 3 Gateway Dr #B1-10 Westgate |
| Westgate | **Gyukatsu 99** | `3 Gateway Dr, #03-09` |  |
| YewTee Point | **Fosters Cafe** | `—` | Permanently closed at 21 CCK North 6 #1-23 |

Two of these are worth calling out:

- **Marché Mövenpick (JEM)** was *added* by the last research-agent update in `DATA_UPDATE.md`. It is closed, and **Casa Vostra** now holds its unit `#01-03`.
- **Shaburi & Kintan Buffet (JEM)** closed and **Hakka Yu** took `#03-11/12`; **SIMPLEburger (JEM)** closed and **iSTEAKS** took `#01-08/09`. The unit numbers corroborate each other.

## 2. Gone from the mall — 14

No outlet at that mall on **two** differently-phrased queries. Strong, but not Google-stated — your call.

| Mall | Entry | Evidence |
|---|---|---|
| AMK Hub | The White Tiffin | no AMK outlet on either query |
| AMK Hub | Kuriya Japanese Market | no AMK outlet on either query |
| Causeway Point | Mak Man Kee Wonton Noodles | only Hong Kong outlets found |
| JEM | Seoul Yummy | no JEM outlet on either query |
| JEM | Penang Culture | no JEM outlet on either query |
| JEM | Nipong Naepong | no JEM outlet on either query |
| Lot One | Pizza Hut | no Lot One outlet on either query |
| Lot One | MOS Burger | no Lot One outlet on either query |
| Northpoint City | Komala's | found at 51 Yishun Central 1, not inside Northpoint City |
| Northpoint City | POCHA! Korean Street Dining | no Northpoint outlet on either query |
| Northpoint City | Tokyo Shokudo | no Northpoint outlet on either query |
| Northpoint City | Yun Nans Stonepot Fish | no Northpoint outlet on either query |
| Westgate | Souperstar | no Westgate outlet on either query |
| Westgate | Pavilion Banana Leaf | no Westgate outlet on either query |

## 3. Cleared on re-check — 4

First pass looked like closures. Second pass proved otherwise. **Do not remove these.**

| Mall | Entry | What actually happened |
|---|---|---|
| JEM | Lao Huo Tang | Lao Huo Tang JEM found on re-query |
| Westgate | Tonkatsu Bistro by Ma Maison | resolved to Tonkatsu by Ma Maison @ Westgate #04-06 |
| Causeway Point | A-One Claypot House | Google lists it as A-One Signature @ Causeway Point |
| Northpoint City | Kopitiam Food Court | resolved to Kopitiam #B2-12 Northpoint City North Wing |

Also cleared during the first pass: **POCHA! (JEM)**, **Kogane Yama (JEM)**, **Maki-San (JEM)**, **Pho Street (Westgate)**, **Beauty in The Pot (Westgate)**, **Ichiban Boshi (AMK Hub)**, **Joy Luck Teahouse (Causeway Point)**, **Bagus Food Hall (Northpoint)**, **Gong Yuan Ma La Tang (YewTee)**, **Tokyo Shokudo (Lot One)** — all appeared in their own result lists.

## 4. Wrong-mall resolution — 3

Google matched a different branch. Only the first is a likely closure; the other two are neighbouring units.

| Mall | Entry | Resolved to |
|---|---|---|
| Westgate | Canton Paradise | `50 Jurong Gateway Rd, #B1-11 Jem` |
| Northpoint City | Burger King | `3 North Point Dr, #01-03 Yishun Town Square` |
| Lot One | McDonald's | `10 CCK Ave 4, #01-21 MRT Station` |

- **Canton Paradise (Westgate)** resolved to the JEM outlet — the Westgate branch looks gone.
- **Burger King (Northpoint)** sits at Yishun Town Square and **McDonald's (Lot One)** at CCK MRT — both adjacent to the mall, arguably still correct for your purposes.

## 5. Unresolved — 2

Generic chain names; Google returns unlabelled duplicates. Needs an eyeball.

- **85 Redhill Teochew Fishball Noodles** (Westgate)
- **Jian Bo Tiong Bahru Shui Kueh** (YewTee Point)

## 6. Renames — 10

Still open, listed under a different name. Worth syncing so future audits match cleanly.

| Mall | Your name | Google name |
|---|---|---|
| JEM | Soi Thai Soi Nice | Pratunam by Soi Thai Soi Nice (JEM) |
| JEM | Seorae Korean Charcoal BBQ | SEORAE JIB (JEM) |
| Northpoint City | Seorae Korean Charcoal BBQ | SEORAE JIB (Northpoint City) |
| Causeway Point | Ajisen Tanjiro | Ajisen Ramen (Causeway Point) |
| Causeway Point | A-One Claypot House | A-One Signature @ Causeway Point |
| Causeway Point | Super Sushi | Super Sushi X Butter Studio |
| Causeway Point | Wang Lu Hotpot | Wanglu Hot Pot Causeway Point |
| YewTee Point | Wang Ji Dim Sum | Wangfu Dimsum Yew Tee Point |
| Westgate | Shoo Loong Kan | Xiao Long Kan Hotpot (Westgate) |
| Lot One | Tokyo Shokudo | Lot 1 Tokyo Shokudo |

## 7. Field data now available

Captured while auditing, cached in `scripts/.cache/audit.jsonl`:

- **Opening hours** — 215/262. Every entry currently defaults to all 7 days in `restaurants.json`; this is real data.
- **Price band** — 223/262 (e.g. `$10–20`), to sanity-check `price_range`.
- **Service options** — 213/262 (`Dine-in`/`Takeaway`/`Delivery`), maps directly onto your `service` field.
- **Unit numbers** — 230/262, which is what makes in-mall vs nearby decidable.

## Suggested order of work

1. Apply section 1 (13 closures) — Google-stated, low risk.
2. Review section 2 (14) and decide; I can re-check any individually.
3. Apply section 6 renames so the next audit is cleaner.
4. Backfill `open_days` and `service` from the cache — biggest quality win, no new lookups needed.
