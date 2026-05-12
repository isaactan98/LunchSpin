import { defineStore } from 'pinia'

export interface Restaurant {
  id: string
  name: string
  area: string
  cuisine: string[]
  meal: ('lunch' | 'dinner')[]
  price_range: 1 | 2 | 3
  open_days: string[]
  tags: string[]
  active: boolean
  notes?: string
}

type MealType = 'lunch' | 'dinner'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface RestaurantsState {
  all: Restaurant[]
  loaded: boolean
  activeOverrides: Record<string, boolean>
  lastPickedId: string | null
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

    /** Count of visible+open restaurants per area for the current meal/day */
    areaCounts(): Record<string, number> {
      const meal = detectMeal()
      const today = todayName()
      const counts: Record<string, number> = {}
      this.visible.forEach((r) => {
        if (!r.meal.includes(meal)) return
        if (!r.open_days.includes(today)) return
        counts[r.area] = (counts[r.area] ?? 0) + 1
      })
      return counts
    },

    /** Currently-available restaurants given meal time + open today */
    availableNow(): Restaurant[] {
      const meal = detectMeal()
      const today = todayName()
      return this.visible.filter(
        (r) => r.meal.includes(meal) && r.open_days.includes(today),
      )
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

    /**
     * Pick a random restaurant. If `area` is provided, restricts to that area.
     * Avoids returning the same restaurant as `lastPickedId` if possible.
     */
    pickRandom(area?: string): Restaurant | null {
      let pool = this.availableNow
      if (area) pool = pool.filter((r) => r.area === area)

      if (pool.length === 0) return null
      if (pool.length === 1) {
        this.lastPickedId = pool[0].id
        return pool[0]
      }

      // Try to avoid repeating the last pick
      const filtered = pool.filter((r) => r.id !== this.lastPickedId)
      const choices = filtered.length > 0 ? filtered : pool
      const pick = choices[Math.floor(Math.random() * choices.length)]
      this.lastPickedId = pick.id
      return pick
    },

    currentMeal(): MealType {
      return detectMeal()
    },
  },
})
