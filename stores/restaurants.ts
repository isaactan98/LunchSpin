import { defineStore } from 'pinia'

export type ServiceMode = 'dine-in' | 'takeaway'
export type OrderingStyle = 'individual' | 'shared' | 'both'
export type SuitableFor = 'solo' | 'date' | 'colleague' | 'family'
export type PayStyle = 'split' | 'treat' | 'either'

export interface Restaurant {
  id: string
  name: string
  area: string
  mall?: string
  cuisine: string[]
  meal: ('lunch' | 'dinner')[]
  price_range: 1 | 2 | 3
  open_days: string[]
  tags: string[]
  active: boolean
  notes?: string
  service: ServiceMode[]
  ordering_style: OrderingStyle
  suitable_for: SuitableFor[]
  pay_style: PayStyle
}

export type MealType = 'lunch' | 'dinner'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const VISIT_HISTORY_KEY = 'lunchspin:visit_history'
const FILTERS_KEY = 'lunchspin:filters'
const RECENT_DAYS = 3

const ALLOWED_PRICES: ReadonlySet<number> = new Set([1, 2, 3])
const ALLOWED_SERVICES: ReadonlySet<string> = new Set(['dine-in', 'takeaway'])
const ALLOWED_WITH: ReadonlySet<string> = new Set(['solo', 'date', 'colleague', 'family'])
const ALLOWED_ORDERING: ReadonlySet<string> = new Set(['individual', 'shared'])
const ALLOWED_PAY: ReadonlySet<string> = new Set(['split', 'treat'])

const WITH_LABEL_MAP: Record<string, string> = {
  solo: 'Solo',
  date: 'Date',
  colleague: 'Work lunch',
  family: 'Family',
}
const SERVICE_LABEL_MAP: Record<string, string> = {
  'dine-in': 'Dine-in',
  'takeaway': 'Takeaway',
}
const ORDERING_LABEL_MAP: Record<string, string> = {
  individual: 'Individual',
  shared: 'Shared',
}
const PAY_LABEL_MAP: Record<string, string> = {
  split: 'Split',
  treat: 'Treat',
}

interface VisitRecord {
  id: string
  date: string
}

function getRecentlyVisitedIds(): string[] {
  if (!import.meta.client) return []
  const raw = localStorage.getItem(VISIT_HISTORY_KEY)
  if (!raw) return []
  try {
    const records = JSON.parse(raw) as VisitRecord[]
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - RECENT_DAYS)
    const thresholdStr = threshold.toISOString().split('T')[0]
    return records.filter((r) => r.date >= thresholdStr).map((r) => r.id)
  } catch {
    return []
  }
}

interface RestaurantsState {
  all: Restaurant[]
  loaded: boolean
  activeOverrides: Record<string, boolean>
  lastPickedId: string | null
  lastPickedMeal: MealType | null
  /** Optional price filters — empty = all */
  priceFilters: (1 | 2 | 3)[]
  /** Optional cuisine filters — empty = all */
  cuisineFilters: string[]
  /** Service filters — defaults to both modes (must be non-empty) */
  serviceFilters: ServiceMode[]
  /** Suitable-for filters — empty = no filter */
  withFilters: SuitableFor[]
  /** Ordering-style filters — empty = no filter */
  orderingFilters: ('individual' | 'shared')[]
  /** Pay-style filters — empty = no filter */
  payFilters: ('split' | 'treat')[]
}

function detectMeal(): MealType {
  return new Date().getHours() < 15 ? 'lunch' : 'dinner'
}

function todayName(): string {
  return DAYS[new Date().getDay()]
}

export const useRestaurantsStore = defineStore('restaurants', {
  state: (): RestaurantsState => ({
    all: [],
    loaded: false,
    activeOverrides: {},
    lastPickedId: null,
    lastPickedMeal: null,
    priceFilters: [],
    cuisineFilters: [],
    serviceFilters: ['dine-in', 'takeaway'],
    withFilters: [],
    orderingFilters: [],
    payFilters: [],
  }),

  getters: {
    visible: (state): Restaurant[] => {
      return state.all.filter((r) => {
        const override = state.activeOverrides[r.id]
        const isActive = override !== undefined ? override : r.active
        return isActive
      })
    },

    allAreas(): string[] {
      const set = new Set<string>()
      this.visible.forEach((r) => set.add(r.area))
      return Array.from(set).sort()
    },

    /** All cuisines that exist in the dataset, sorted */
    allCuisines(): string[] {
      const set = new Set<string>()
      this.visible.forEach((r) => r.cuisine.forEach((c) => set.add(c)))
      return Array.from(set).sort()
    },

    /** Human-readable summary of active filters. Empty if none. */
    filterSummary(state): string {
      const parts: string[] = []
      if (state.priceFilters.length > 0) {
        parts.push(
          state.priceFilters
            .slice()
            .sort((a, b) => a - b)
            .map((p) => '$'.repeat(p))
            .join('/'),
        )
      }
      if (state.withFilters.length > 0) {
        parts.push(state.withFilters.map((w) => WITH_LABEL_MAP[w] ?? w).join('/'))
      }
      if (state.serviceFilters.length !== 2) {
        parts.push(state.serviceFilters.map((s) => SERVICE_LABEL_MAP[s] ?? s).join('/'))
      }
      if (state.orderingFilters.length > 0) {
        parts.push(state.orderingFilters.map((o) => ORDERING_LABEL_MAP[o] ?? o).join('/'))
      }
      if (state.payFilters.length > 0) {
        parts.push(state.payFilters.map((p) => PAY_LABEL_MAP[p] ?? p).join('/'))
      }
      if (state.cuisineFilters.length > 0) {
        parts.push(state.cuisineFilters.join(', '))
      }
      return parts.join(' · ')
    },

    /** Returns true if any optional filter is currently applied */
    hasActiveFilters(state): boolean {
      return (
        state.priceFilters.length > 0
        || state.cuisineFilters.length > 0
        || state.withFilters.length > 0
        || state.orderingFilters.length > 0
        || state.payFilters.length > 0
        || state.serviceFilters.length !== 2
      )
    },

    /**
     * Restaurants available right now, with all filters applied:
     * - meal (auto-detected)
     * - open today
     * - active overrides
     * - optional price filters
     * - optional cuisine filters
     */
    availableNow(): Restaurant[] {
      const meal = detectMeal()
      const today = todayName()
      const { priceFilters, cuisineFilters, serviceFilters, withFilters, orderingFilters, payFilters } = this
      return this.visible.filter((r) => {
        if (!r.meal.includes(meal)) return false
        if (!r.open_days.includes(today)) return false
        if (priceFilters.length > 0 && !priceFilters.includes(r.price_range)) return false
        if (cuisineFilters.length > 0 && !r.cuisine.some((c) => cuisineFilters.includes(c))) return false

        // service: restaurant must offer at least one of the selected services
        if (!r.service.some((s) => serviceFilters.includes(s))) return false

        // with: if user selected any, restaurant must support at least one of them
        if (withFilters.length > 0 && !r.suitable_for.some((w) => withFilters.includes(w))) return false

        // ordering: 'both' on restaurant matches any filter; else direct match
        if (orderingFilters.length > 0) {
          const matches
            = r.ordering_style === 'both'
              || orderingFilters.includes(r.ordering_style as 'individual' | 'shared')
          if (!matches) return false
        }

        // pay: 'either' on restaurant matches any filter; else direct match
        if (payFilters.length > 0) {
          const matches
            = r.pay_style === 'either'
              || payFilters.includes(r.pay_style as 'split' | 'treat')
          if (!matches) return false
        }

        return true
      })
    },

    /** Count of currently-available restaurants per area (respects filters) */
    areaCounts(): Record<string, number> {
      const counts: Record<string, number> = {}
      this.availableNow.forEach((r) => {
        counts[r.area] = (counts[r.area] ?? 0) + 1
      })
      return counts
    },
  },

  actions: {
    async load() {
      if (this.loaded) return
      const data = await $fetch<{ restaurants: Restaurant[] }>('/data/restaurants.json')
      this.all = data.restaurants

      if (import.meta.dev) {
        const deprecatedTags = new Set(['solo', 'with-gf', 'group'])
        for (const r of this.all) {
          const bad = r.tags?.filter((t) => deprecatedTags.has(t)) ?? []
          if (bad.length > 0) {
            throw new Error(
              `[restaurants] ${r.name} (${r.id}) still has deprecated tags: ${bad.join(', ')}`,
            )
          }
          if (!Array.isArray(r.service) || r.service.length === 0) {
            throw new Error(`[restaurants] ${r.name} (${r.id}) missing required field 'service'`)
          }
          if (!r.ordering_style) {
            throw new Error(`[restaurants] ${r.name} (${r.id}) missing required field 'ordering_style'`)
          }
          if (!Array.isArray(r.suitable_for) || r.suitable_for.length === 0) {
            throw new Error(`[restaurants] ${r.name} (${r.id}) missing required field 'suitable_for'`)
          }
          if (!r.pay_style) {
            throw new Error(`[restaurants] ${r.name} (${r.id}) missing required field 'pay_style'`)
          }
        }
      }

      this.loaded = true
    },

    loadActiveOverrides() {
      if (import.meta.client) {
        const raw = localStorage.getItem('lunchspin:active_overrides')
        if (raw) {
          try {
            this.activeOverrides = JSON.parse(raw)
          } catch {
            this.activeOverrides = {}
          }
        }
      }
    },

    loadFilters() {
      if (!import.meta.client) return
      const raw = localStorage.getItem(FILTERS_KEY)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>

        if (Array.isArray(parsed.priceFilters)) {
          const valid = parsed.priceFilters.filter(
            (v): v is 1 | 2 | 3 => typeof v === 'number' && ALLOWED_PRICES.has(v),
          )
          this.priceFilters = valid
        }

        if (Array.isArray(parsed.cuisineFilters)) {
          const valid = parsed.cuisineFilters.filter((v): v is string => typeof v === 'string')
          this.cuisineFilters = valid
        }

        if (Array.isArray(parsed.serviceFilters)) {
          const valid = parsed.serviceFilters.filter(
            (v): v is ServiceMode => typeof v === 'string' && ALLOWED_SERVICES.has(v),
          ) as ServiceMode[]
          // Service must be non-empty; fall back to default if empty after validation
          this.serviceFilters = valid.length > 0 ? valid : ['dine-in', 'takeaway']
        }

        if (Array.isArray(parsed.withFilters)) {
          const valid = parsed.withFilters.filter(
            (v): v is SuitableFor => typeof v === 'string' && ALLOWED_WITH.has(v),
          ) as SuitableFor[]
          this.withFilters = valid
        }

        if (Array.isArray(parsed.orderingFilters)) {
          const valid = parsed.orderingFilters.filter(
            (v): v is 'individual' | 'shared' =>
              typeof v === 'string' && ALLOWED_ORDERING.has(v),
          )
          this.orderingFilters = valid
        }

        if (Array.isArray(parsed.payFilters)) {
          const valid = parsed.payFilters.filter(
            (v): v is 'split' | 'treat' => typeof v === 'string' && ALLOWED_PAY.has(v),
          )
          this.payFilters = valid
        }
      } catch {
        // Ignore corrupted storage
      }
    },

    persistFilters() {
      if (!import.meta.client) return
      try {
        const payload = {
          priceFilters: this.priceFilters,
          cuisineFilters: this.cuisineFilters,
          serviceFilters: this.serviceFilters,
          withFilters: this.withFilters,
          orderingFilters: this.orderingFilters,
          payFilters: this.payFilters,
        }
        localStorage.setItem(FILTERS_KEY, JSON.stringify(payload))
      } catch {
        // Ignore quota/serialization errors
      }
    },

    setActiveOverride(id: string, active: boolean) {
      this.activeOverrides[id] = active
      if (import.meta.client) {
        localStorage.setItem('lunchspin:active_overrides', JSON.stringify(this.activeOverrides))
      }
    },

    isActive(id: string): boolean {
      const restaurant = this.all.find((r) => r.id === id)
      if (!restaurant) return false
      const override = this.activeOverrides[id]
      return override !== undefined ? override : restaurant.active
    },

    togglePriceFilter(price: 1 | 2 | 3) {
      const idx = this.priceFilters.indexOf(price)
      if (idx === -1) this.priceFilters.push(price)
      else this.priceFilters.splice(idx, 1)
    },

    toggleCuisineFilter(cuisine: string) {
      const idx = this.cuisineFilters.indexOf(cuisine)
      if (idx === -1) this.cuisineFilters.push(cuisine)
      else this.cuisineFilters.splice(idx, 1)
    },

    toggleServiceFilter(s: ServiceMode) {
      const idx = this.serviceFilters.indexOf(s)
      if (idx === -1) {
        this.serviceFilters.push(s)
      } else {
        // Refuse to leave empty
        if (this.serviceFilters.length <= 1) return
        this.serviceFilters.splice(idx, 1)
      }
    },

    toggleWithFilter(w: SuitableFor) {
      const idx = this.withFilters.indexOf(w)
      if (idx === -1) this.withFilters.push(w)
      else this.withFilters.splice(idx, 1)
    },

    toggleOrderingFilter(o: 'individual' | 'shared') {
      const idx = this.orderingFilters.indexOf(o)
      if (idx === -1) this.orderingFilters.push(o)
      else this.orderingFilters.splice(idx, 1)
    },

    togglePayFilter(p: 'split' | 'treat') {
      const idx = this.payFilters.indexOf(p)
      if (idx === -1) this.payFilters.push(p)
      else this.payFilters.splice(idx, 1)
    },

    clearFilters() {
      this.priceFilters = []
      this.cuisineFilters = []
      this.serviceFilters = ['dine-in', 'takeaway']
      this.withFilters = []
      this.orderingFilters = []
      this.payFilters = []
    },

    /**
     * Pick a random restaurant. If `area` is provided, restricts to that area.
     * Avoids returning the same restaurant as `lastPickedId` if possible.
     * Respects price + cuisine filters via availableNow.
     */
    pickRandom(area?: string): Restaurant | null {
      let pool = this.availableNow
      if (area) pool = pool.filter((r) => r.area === area)

      if (pool.length === 0) return null
      if (pool.length === 1) {
        this.lastPickedId = pool[0].id
        this.lastPickedMeal = detectMeal()
        return pool[0]
      }

      // Avoid the last-picked restaurant if possible
      let working = pool.filter((r) => r.id !== this.lastPickedId)
      if (working.length === 0) working = pool

      // Prefer pool members NOT recently visited; fall back if none remain
      const recentIds = new Set(getRecentlyVisitedIds())
      const notRecent = working.filter((r) => !recentIds.has(r.id))
      const choices = notRecent.length > 0 ? notRecent : working

      const pick = choices[Math.floor(Math.random() * choices.length)]
      this.lastPickedId = pick.id
      this.lastPickedMeal = detectMeal()
      return pick
    },

    currentMeal(): MealType {
      return detectMeal()
    },
  },
})
