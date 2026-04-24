import { defineStore } from 'pinia'
import type { Restaurant } from './restaurants'

type MealType = 'lunch' | 'dinner'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export interface FilterState {
  meal: MealType
  cuisines: string[]
  priceRanges: (1 | 2 | 3)[]
  tags: string[]
  excludeRecentlyVisited: boolean
}

interface SessionState {
  filters: FilterState
  pool: Restaurant[]
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
      cuisines: [],
      priceRanges: [1, 2, 3],
      tags: [],
      excludeRecentlyVisited: true,
    },
    pool: [],
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

    buildPool(
      restaurants: Restaurant[],
      recentlyVisited: string[],
    ) {
      const { meal, cuisines, priceRanges, tags, excludeRecentlyVisited } = this.filters
      const today = DAYS[new Date().getDay()]

      let pool = restaurants.filter((r) => {
        if (!r.meal.includes(meal)) return false
        if (!r.open_days.includes(today)) return false
        if (!priceRanges.includes(r.price_range)) return false
        if (cuisines.length > 0 && !r.cuisine.some((c) => cuisines.includes(c))) return false
        if (tags.length > 0 && !r.tags.some((t) => tags.includes(t))) return false
        if (excludeRecentlyVisited && recentlyVisited.includes(r.id)) return false
        if (this.todayExclusions.includes(r.id)) return false
        return true
      })

      // Shuffle the pool
      pool = pool.sort(() => Math.random() - 0.5)
      this.pool = pool
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

      // Split pool into bracket rounds
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
      // Pick the first two in the current round
      this.currentMatchup = [currentRound[0], currentRound[1]]
    },

    pick(winner: Restaurant) {
      const currentRound = this.bracket[this.round]
      // Remove the two that were matched
      const remaining = currentRound.slice(2)
      // Winner advances to next round
      const nextRoundCandidates = [winner, ...remaining]

      if (nextRoundCandidates.length === 1) {
        this.winner = nextRoundCandidates[0]
        this.currentMatchup = null
        return
      }

      if (nextRoundCandidates.length === 2) {
        // Start next round with these two
        this.round++
        this.bracket.push(nextRoundCandidates)
        this.currentMatchup = [nextRoundCandidates[0], nextRoundCandidates[1]]
        return
      }

      // Update current round with remaining + winner advancing next iteration
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
        cuisines: [],
        priceRanges: [1, 2, 3],
        tags: [],
        excludeRecentlyVisited: true,
      }
      this.pool = []
      this.bracket = []
      this.currentMatchup = null
      this.winner = null
      this.round = 0
    },
  },
})
