import { defineStore } from 'pinia'

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
}

export type MealType = 'lunch' | 'dinner'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const VISIT_HISTORY_KEY = 'lunchspin:visit_history'
const RECENT_DAYS = 3

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

    /** Returns true if any optional filter is currently applied */
    hasActiveFilters(state): boolean {
      return state.priceFilters.length > 0 || state.cuisineFilters.length > 0
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
      const { priceFilters, cuisineFilters } = this
      return this.visible.filter((r) => {
        if (!r.meal.includes(meal)) return false
        if (!r.open_days.includes(today)) return false
        if (priceFilters.length > 0 && !priceFilters.includes(r.price_range)) return false
        if (cuisineFilters.length > 0 && !r.cuisine.some((c) => cuisineFilters.includes(c))) return false
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

    clearFilters() {
      this.priceFilters = []
      this.cuisineFilters = []
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
