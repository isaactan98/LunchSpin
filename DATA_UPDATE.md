# LunchSpin Restaurant Data Update

Three parallel research agents audited the 202 restaurants across 7 malls. This spec lists ONLY high-confidence changes — closures with strong evidence (closure news, directory absence + brand contraction signals), and new openings confirmed in 2025–2026 sources.

Implement by writing a one-off Node script at `/tmp/update-restaurants.mjs` that loads `public/data/restaurants.json`, applies the changes below, and writes back. Run, verify counts, delete script.

For NEW restaurants, generate the 4 archetype fields (`service`, `ordering_style`, `suitable_for`, `pay_style`) using the archetype rules from `FEATURE_SPEC.md`. Use mall-prefixed unique ids (e.g. `jem-hakka-yu`, `westgate-tim-ho-wan`). Set `active: true`, `open_days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]` unless otherwise noted.

---

## CLOSURES — remove these from the list

### JEM
- **Pizzakaya** — WhereHalal flagged permanently closed; absent from 2025–2026 JEM tenant directories

### Westgate
- **Old Chengdu Sichuan Braised** — absent from 2026 Westgate directory
- **Hanok by Masizzim** — brand contracted in SG, no longer at Westgate
- **Crystal Jade Kitchen** — replaced by Tim Ho Wan (which returned to the same spot)

### AMK Hub
- **Soup Restaurant** — Burpple explicitly marks `[CLOSED]`; not in current Link REIT tenant list

### Lot One
- **Steak 99** — absent from CapitaLand official 2026 directory
- **Talad Thai Banana** — absent from CapitaLand official 2026 directory
- **Tokyo Shokudo Milan Shokudo** — renamed to plain "Tokyo Shokudo" at Lot One (keep an entry as Tokyo Shokudo, but rename the existing one — see below)

### Causeway Point, Northpoint, YewTee Point
- No high-confidence closures.

**Note on Northpoint**: research agent flagged Crystal Jade Kitchen, Pho Street, Saizeriya, Ichiban Boshi, Sushi Express, Wingstop as possibly closed (absent from 2026 directories). These are major SG chains and the directories are known to be incomplete. DO NOT remove these — too risky.

**Note on AMK Hub**: research agent flagged Putien, Crystal Jade, Sakae Sushi, Manhattan Fish Market, Yoshinoya as possibly closed. Same risk — major chains. DO NOT remove.

---

## RENAMES — update existing entries

### Lot One
- `lot1-tokyo-shokudo` (currently "Tokyo Shokudo Milan Shokudo") → rename to plain "Tokyo Shokudo". Cuisine stays `["Japanese", "Italian"]`. Update id to `lot1-tokyo-shokudo` (already that). Just change the `name` field.

---

## NEW ADDITIONS

Apply archetype rules from `FEATURE_SPEC.md` to set `service`, `ordering_style`, `suitable_for`, `pay_style`. Brief notes provided to help.

### JEM additions (14)

| Name | Cuisine | Price | Meal | Notes for archetype |
|---|---|---|---|---|
| Hakka Yu | Chinese | $$ | both | Hakka claypot — Chinese sit-down sharing |
| Tai Er | Chinese | $$ | both | Sichuan sauerkraut fish — Chinese sit-down sharing |
| Marché Mövenpick | Western | $$ | both | International market-style — casual Western, family |
| Jack's Place | Western | $$ | both | Classic SG steakhouse — casual Western |
| Pepper Lunch | Japanese | $ | both | Sizzling DIY plates — ramen/donburi archetype |
| Ichiban Boshi | Japanese | $$ | both | Sit-down Japanese chain |
| Kogane Yama | Japanese | $$ | both | Unagi/donburi specialist |
| LeNu Chef Wai's Noodle Bar | Chinese | $$ | both | Premium beef noodles — ramen archetype (individual) |
| Seoul Yummy | Korean | $$ | both | Korean army stew — Korean casual |
| Penang Culture | Malay | $$ | both | Penang hawker — Malay |
| Monga Fried Chicken | Western | $ | both | Taiwanese fried chicken — burger/wraps |
| PastaMania | Italian | $ | both | Pasta chain — casual Western |
| D'Penyetz | Malay | $ | both | Ayam penyet — Malay |
| Lee Wee & Brothers | Malay | $ | lunch | Local hawker-style — Malay |

### Westgate additions (18)

| Name | Cuisine | Price | Meal | Notes |
|---|---|---|---|---|
| Tim Ho Wan | Chinese | $$ | both | Dim sum (returned to Westgate) — Chinese sit-down sharing |
| Buta Kizoku | Japanese | $$ | both | Pork specialist — sit-down Japanese |
| Astons Specialities | Western | $$ | both | Affordable steakhouse — casual Western |
| Guzman Y Gomez | Western | $ | both | Mexican fast-casual — fast food archetype |
| Sanook Kitchen | Thai | $ | both | Casual Thai |
| Pho Street | Vietnamese | $ | both | Pho — Vietnamese |
| Wang Fu Dim Sum | Chinese | $ | both | Cantonese dim sum — Chinese sit-down sharing |
| Xiang Xiang Hunan Cuisine | Chinese | $$ | both | Hunan — Chinese sit-down sharing |
| Tongue Tip Lanzhou Beef Noodles | Chinese | $ | both | Hand-pulled noodles — individual ordering |
| Anjappar | Indian | $$ | both | Chettinad Indian |
| Pavilion Banana Leaf | Indian | $$ | both | South Indian banana leaf |
| Curry Times | Multi-cuisine | $ | both | Singaporean curry |
| Greendot | Multi-cuisine | $ | both | Plant-based Asian |
| Shabu Sai | Japanese | $$ | both | Shabu-shabu buffet — hotpot archetype |
| Tonkatsu Bistro by Ma Maison | Japanese | $$ | both | Tonkatsu — ramen archetype |
| Long John Silver's | Western | $ | both | Fast food |
| Sushi Express | Japanese | $ | both | Conveyor sushi — casual sushi |
| 85 Redhill Teochew Fishball Noodles | Hawker | $ | lunch | Fishball noodles — hawker |
| Food Junction | Hawker | $ | both | Food court — hawker |

### Causeway Point additions (4)

| Name | Cuisine | Price | Meal | Notes |
|---|---|---|---|---|
| Ah Ma Chi Mian | Chinese | $ | both | Hand-pulled noodles |
| Swensen's | Western | $$ | both | American family chain — casual Western |
| Joy Luck Teahouse | Chinese | $ | both | HK-style noodles + egg tarts |
| Tenderfresh | Western | $ | both | Local fried chicken — burger/wraps |

### AMK Hub additions (8)

| Name | Cuisine | Price | Meal | Notes |
|---|---|---|---|---|
| Sushi-GO | Japanese | $$ | both | Conveyor sushi with robot servers |
| A One Signature | Chinese | $$ | both | Cantonese roasts (NOTE: similar name to A-One Signature at Northpoint — these are DIFFERENT restaurants, both real) |
| TORI-Q | Japanese | $ | both | Yakitori counter — sit-down Japanese |
| Shiok Burger | Western | $ | both | Local burger chain — burger/wraps |
| Jia Li Seafood Soup | Chinese | $ | both | Hawker-style seafood soup — Chinese sit-down |
| Qi Ji | Multi-cuisine | $ | both | Local rice/noodle chain |
| Yew Kee Specialities | Chinese | $ | both | Cantonese/local dishes |
| Kuriya Japanese Market | Japanese | $$ | both | Japanese deli + dine-in |

### Northpoint City additions (15)

| Name | Cuisine | Price | Meal | Notes |
|---|---|---|---|---|
| Yun Nans Stonepot Fish | Chinese | $$ | both | Yunnan-style stone-pot fish |
| Song Fa Bak Kut Teh | Chinese | $$ | both | Teochew peppery BKT (individual override) |
| Hakka Yu | Chinese | $$ | both | Hakka claypot |
| LeNu Chef Wai's Noodle Bar | Chinese | $$ | both | Premium beef noodle bar |
| Hatsumi Donburi & Soba | Japanese | $$ | both | Donburi/soba specialist |
| Yappari Steak | Japanese | $$ | both | Okinawan-style steak |
| Kuriya Japanese Market | Japanese | $$ | both | Japanese deli + dine-in |
| Ajumma's | Korean | $$ | both | Korean home-cooking |
| Namu Bulgogi | Korean | $$ | both | Korean BBQ — Korean BBQ (hotpot/BBQ archetype: dine-in, shared, [date, colleague, family]) |
| Hot Tomato Cafe & Grill | Western | $$ | both | Western steaks/pasta |
| Swensen's | Western | $$ | both | American family chain |
| COLLIN'S | Western | $$ | both | Affordable Western grill |
| Monster Curry | Japanese | $$ | both | Japanese curry |
| Dabba Street | Indian | $$ | both | Modern Indian |
| Bagus Food Hall by Kopitiam | Hawker | $ | both | NEW halal food court, opened May 2026 |

### Lot One additions (5)

| Name | Cuisine | Price | Meal | Notes |
|---|---|---|---|---|
| Sushiro | Japanese | $$ | both | Conveyor sushi — casual sushi |
| Yakiniku Shokudo | Japanese | $$ | dinner | Affordable yakiniku — hotpot/BBQ archetype |
| Pizza Hut | Italian | $$ | both | Casual Italian — fast food / casual Western |
| MOS Burger | Western | $ | both | Japanese-style burgers — fast food |
| Tenderfresh XPRESS | Western | $ | both | Local fried chicken — burger/wraps |

### YewTee Point additions (3)

| Name | Cuisine | Price | Meal | Notes |
|---|---|---|---|---|
| Yew Kee Specialities | Chinese | $ | both | Specialty rice/noodles |
| Tenderfresh | Western | $ | both | Local fried chicken — burger/wraps |
| Fosters Cafe | Western | $$ | both | Scones + steaks |

---

## Implementation steps for the developer

1. Write one-off node script at `/tmp/update-restaurants.mjs`.
2. **Step A (closures)**: Filter out the restaurants listed in CLOSURES section (match by `name` exactly, scoped to the right `mall`).
3. **Step B (renames)**: Rename `Tokyo Shokudo Milan Shokudo` at Lot One → `Tokyo Shokudo`.
4. **Step C (additions)**: For each new restaurant, build the full Restaurant object:
   - id: prefix-based unique (`jem-hakka-yu`, `westgate-tim-ho-wan-2`, etc.)
   - name, area (Jurong East / Woodlands / Ang Mo Kio / Yishun / Chua Chu Kang / Yew Tee), mall, cuisine array, meal array, price_range (1/2/3), open_days (default all 7 unless lunch-only marked above), tags (start with `["restaurant"]` for casual, `["hawker"]` for food courts/hawker stalls, append `quick` for fast food, etc.)
   - active: true
   - notes: 1-line description (copy from the table)
   - **service / ordering_style / suitable_for / pay_style**: apply archetype rules from `FEATURE_SPEC.md` based on the cuisine + name. Most defaults: `service: ["dine-in", "takeaway"]`, `ordering_style: "individual"`, `suitable_for: ["solo", "colleague", "family"]`, `pay_style: "split"`. Adjust for hotpot/BBQ (dine-in only, shared, [date, colleague, family]), premium (treat), etc.
5. Write JSON back with proper indentation (2 spaces).
6. Delete the script after verifying.

## Verification

After running the script:

```bash
cd /Users/isaactan/Projects/LunchSpin
# Should be approximately 202 - 8 (closures) + 67 (additions) = 261
jq '.restaurants | length' public/data/restaurants.json

# Per-mall counts (rough targets)
jq -r '[.restaurants[].mall] | group_by(.) | map({mall: .[0], count: length}) | .[]' public/data/restaurants.json
# Targets:
# JEM: 25 - 1 + 14 = 38
# Westgate: 29 - 3 + 18 = 44
# Causeway Point: 42 + 4 = 46
# AMK Hub: 38 - 1 + 8 = 45
# Northpoint City: 39 + 15 = 54
# Lot One: 16 - 2 + 5 = 19 (Tokyo Shokudo Milan Shokudo stays, just renamed)
# YewTee Point: 13 + 3 = 16

# All restaurants must still have all 4 new fields populated
jq '[.restaurants[] | select(.service == null or .ordering_style == null or .suitable_for == null or .pay_style == null)] | length' public/data/restaurants.json
# Expected: 0

# Pizzakaya, Old Chengdu, Hanok, Crystal Jade Kitchen (Westgate), Soup Restaurant (AMK), Steak 99 (Lot1), Talad Thai (Lot1) all gone
jq '[.restaurants[] | select(.name == "Pizzakaya" or .name == "Old Chengdu Sichuan Braised" or .name == "Hanok by Masizzim" or .name == "Soup Restaurant" or .name == "Steak 99" or .name == "Talad Thai Banana")] | length' public/data/restaurants.json
# Expected: 0
```

Then `npm run build` to confirm nothing breaks.
