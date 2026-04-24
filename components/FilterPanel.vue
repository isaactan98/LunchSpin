<template>
  <div class="space-y-6 p-4">
    <!-- Meal -->
    <div>
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Meal</h3>
      <div class="flex gap-3">
        <button
          v-for="option in mealOptions"
          :key="option.value"
          class="flex-1 py-3 rounded-xl font-semibold text-sm transition-all border"
          :class="
            filters.meal === option.value
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
          "
          @click="setMeal(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Price Range -->
    <div>
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Price Range</h3>
      <div class="flex gap-3">
        <button
          v-for="price in [1, 2, 3]"
          :key="price"
          class="flex-1 py-3 rounded-xl font-semibold text-sm transition-all border"
          :class="
            filters.priceRanges.includes(price as 1 | 2 | 3)
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
          "
          @click="togglePrice(price as 1 | 2 | 3)"
        >
          {{ '$'.repeat(price) }}
        </button>
      </div>
      <p class="text-xs text-slate-500 mt-2">$ under $10 · $$ $10–$25 · $$$ $25+</p>
    </div>

    <!-- Cuisine -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Cuisine</h3>
        <button
          class="text-xs text-orange-400 hover:text-orange-300"
          @click="toggleAllCuisines"
        >
          {{ filters.cuisines.length === 0 ? 'Select all' : 'Clear all' }}
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cuisine in cuisines"
          :key="cuisine"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
          :class="
            filters.cuisines.includes(cuisine)
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
          "
          @click="toggleCuisine(cuisine)"
        >
          {{ cuisine }}
        </button>
      </div>
    </div>

    <!-- Tags -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Vibe</h3>
        <button
          v-if="filters.tags.length > 0"
          class="text-xs text-orange-400 hover:text-orange-300"
          @click="clearTags"
        >
          Clear
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in allTags"
          :key="tag.value"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
          :class="
            filters.tags.includes(tag.value)
              ? 'bg-violet-600 border-violet-600 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
          "
          @click="toggleTag(tag.value)"
        >
          {{ tag.label }}
        </button>
      </div>
    </div>

    <!-- Exclude recently visited -->
    <div class="flex items-center justify-between py-3 border-t border-slate-800">
      <div>
        <p class="text-sm font-medium text-slate-200">Skip recent visits</p>
        <p class="text-xs text-slate-500">Hide places visited in the last 3 days</p>
      </div>
      <button
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        :class="filters.excludeRecentlyVisited ? 'bg-orange-500' : 'bg-slate-700'"
        @click="toggleExcludeRecent"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          :class="filters.excludeRecentlyVisited ? 'translate-x-6' : 'translate-x-1'"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useRestaurantsStore } from '~/stores/restaurants'

const sessionStore = useSessionStore()
const restaurantsStore = useRestaurantsStore()

const filters = computed(() => sessionStore.filters)
const cuisines = computed(() => restaurantsStore.allCuisines)

const mealOptions = [
  { value: 'lunch' as const, label: '☀️ Lunch' },
  { value: 'dinner' as const, label: '🌙 Dinner' },
]

const allTags = [
  { value: 'solo', label: 'Solo' },
  { value: 'group', label: 'Group' },
  { value: 'with-gf', label: 'Date' },
  { value: 'quick', label: 'Quick' },
  { value: 'leisure', label: 'Leisurely' },
  { value: 'hawker', label: 'Hawker' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'fast-food', label: 'Fast Food' },
]

function setMeal(meal: 'lunch' | 'dinner') {
  sessionStore.setFilters({ meal })
}

function togglePrice(price: 1 | 2 | 3) {
  const current = [...filters.value.priceRanges]
  const idx = current.indexOf(price)
  if (idx === -1) {
    current.push(price)
  } else if (current.length > 1) {
    current.splice(idx, 1)
  }
  sessionStore.setFilters({ priceRanges: current })
}

function toggleCuisine(cuisine: string) {
  const current = [...filters.value.cuisines]
  const idx = current.indexOf(cuisine)
  if (idx === -1) {
    current.push(cuisine)
  } else {
    current.splice(idx, 1)
  }
  sessionStore.setFilters({ cuisines: current })
}

function toggleAllCuisines() {
  if (filters.value.cuisines.length === 0) {
    sessionStore.setFilters({ cuisines: [...cuisines.value] })
  } else {
    sessionStore.setFilters({ cuisines: [] })
  }
}

function toggleTag(tag: string) {
  const current = [...filters.value.tags]
  const idx = current.indexOf(tag)
  if (idx === -1) {
    current.push(tag)
  } else {
    current.splice(idx, 1)
  }
  sessionStore.setFilters({ tags: current })
}

function clearTags() {
  sessionStore.setFilters({ tags: [] })
}

function toggleExcludeRecent() {
  sessionStore.setFilters({ excludeRecentlyVisited: !filters.value.excludeRecentlyVisited })
}
</script>
