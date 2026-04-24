import { defineStore } from 'pinia'
import type { Restaurant } from './restaurants'

type MealType = 'lunch' | 'dinner'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Max restaurants shown in a bracket round — keeps clicks under control
const BRACKET_SAMPLE_SIZE = 8

export interface FilterState {
  meal: MealType
  areas: string[]
  cuisines: string[]
  priceRanges: (1 | 2 | 3)[]
  tags: string[]
  excludeRecentlyVisited: boolean
}

interface SessionState {
  filters: FilterState
  pool: Restaurant[]
  poolSize: number // total matching before sampling
  bracket: Restaurant[][]
  currentMatchup: [Restaurant, Restaurant] | null
  winner: Restaurant | null
  todayExclusions: string[]
  round: number
}

function detectMeal(): MealType {
  const hour = new Date().getHours()
  return hour < 15 ? 'lunch' : 'dinner'
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    filters: {
      meal: detectMeal(),
      areas: [],
      cuisines: [],
      priceRanges: [1, 2, 3],
      tags: [],
      excludeRecentlyVisited: true,
    },
    pool: [],
    poolSize: 0,
    bracket: [],
    currentMatchup: null,
    winner: null,
    todayExclusions: [],
    round: 0,
  }),

  getters: {
    todayDayName: (): string => {
      return DAYS[new Date().getDay()]
    },
  },

  actions: {
    setFilters(partial: Partial<FilterState>) {
      this.filters = { ...this.filters, ...partial }
    },

    buildPool(restaurants: Restaurant[], recentlyVisited: string[]) {
      const { meal, areas, cuisines, priceRanges, tags, excludeRecentlyVisited } = this.filters
      const today = DAYS[new Date().getDay()]

      let filtered = restaurants.filter((r) => {
        if (!r.meal.includes(meal)) return false
        if (!r.open_days.includes(today)) return false
        if (!priceRanges.includes(r.price_range)) return false
        if (areas.length > 0 && !areas.includes(r.area)) return false
        if (cuisines.length > 0 && !r.cuisine.some((c) => cuisines.includes(c))) return false
        if (tags.length > 0 && !r.tags.some((t) => tags.includes(t))) return false
        if (excludeRecentlyVisited && recentlyVisited.includes(r.id)) return false
        if (this.todayExclusions.includes(r.id)) return false
        return true
      })

      // Shuffle
      filtered = filtered.sort(() => Math.random() - 0.5)

      this.poolSize = filtered.length
      // Cap to BRACKET_SAMPLE_SIZE so clicks are bounded regardless of list size
      this.pool = filtered.slice(0, BRACKET_SAMPLE_SIZE)
    },

    startBracket() {
      this.winner = null
      this.round = 0

      if (this.pool.length === 0) {
        this.currentMatchup = null
        return
      }

      if (this.pool.length === 1) {
        this.winner = this.pool[0]
        this.currentMatchup = null
        return
      }

      this.bracket = [this.pool.slice()]
      this.advanceToNextMatchup()
    },

    advanceToNextMatchup() {
      const currentRound = this.bracket[this.round]
      if (!currentRound || currentRound.length < 2) {
        if (currentRound && currentRound.length === 1) {
          this.winner = currentRound[0]
        }
        this.currentMatchup = null
        return
      }
      this.currentMatchup = [currentRound[0], currentRound[1]]
    },

    pick(winner: Restaurant) {
      const currentRound = this.bracket[this.round]
      const remaining = currentRound.slice(2)
      const nextRoundCandidates = [winner, ...remaining]

      if (nextRoundCandidates.length === 1) {
        this.winner = nextRoundCandidates[0]
        this.currentMatchup = null
        return
      }

      if (nextRoundCandidates.length === 2) {
        this.round++
        this.bracket.push(nextRoundCandidates)
        this.currentMatchup = [nextRoundCandidates[0], nextRoundCandidates[1]]
        return
      }

      this.bracket[this.round] = nextRoundCandidates
      this.advanceToNextMatchup()
    },

    excludeToday(id: string) {
      if (!this.todayExclusions.includes(id)) {
        this.todayExclusions.push(id)
      }
    },

    reset() {
      const meal = detectMeal()
      this.filters = {
        meal,
        areas: [],
        cuisines: [],
        priceRanges: [1, 2, 3],
        tags: [],
        excludeRecentlyVisited: true,
      }
      this.pool = []
      this.poolSize = 0
      this.bracket = []
      this.currentMatchup = null
      this.winner = null
      this.round = 0
    },
  },
})
