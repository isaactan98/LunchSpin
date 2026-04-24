<template>
  <div class="flex flex-col min-h-full">
    <!-- Header -->
    <header class="px-4 pt-8 pb-4">
      <div class="flex items-baseline gap-2">
        <h1 class="text-2xl font-bold text-white">LunchSpin</h1>
        <span class="text-slate-400 text-sm">{{ todayDisplay }}</span>
      </div>
      <p class="text-slate-400 text-sm mt-1">What are we eating today?</p>
    </header>

    <!-- Filters -->
    <div class="flex-1 overflow-y-auto">
      <FilterPanel />
    </div>

    <!-- Pool preview -->
    <div class="px-4 py-3 border-t border-slate-800">
      <p class="text-xs text-slate-500 text-center">
        <span v-if="poolCount > 0">
          {{ poolCount }} place{{ poolCount !== 1 ? 's' : '' }} match your filters
        </span>
        <span v-else class="text-amber-400">
          No places match — try relaxing your filters
        </span>
      </p>
    </div>

    <!-- CTA -->
    <div class="p-4 pb-6">
      <button
        class="w-full py-4 rounded-2xl font-bold text-lg transition-all"
        :class="
          poolCount > 0
            ? 'bg-orange-500 hover:bg-orange-400 text-white active:scale-95'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        "
        :disabled="poolCount === 0"
        @click="startDeciding"
      >
        {{ poolCount === 1 ? 'Pick this one!' : "Let's Spin" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useRestaurantsStore } from '~/stores/restaurants'
import { useVisitHistory } from '~/composables/useVisitHistory'

const router = useRouter()
const sessionStore = useSessionStore()
const restaurantsStore = useRestaurantsStore()
const { getRecentlyVisited } = useVisitHistory()

const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const todayDisplay = computed(() => {
  const d = new Date()
  return DAYS_LONG[d.getDay()]
})

const poolCount = computed(() => {
  const recentlyVisited = getRecentlyVisited()
  const filters = sessionStore.filters
  const today = sessionStore.todayDayName

  return restaurantsStore.visible.filter((r) => {
    if (!r.meal.includes(filters.meal)) return false
    if (!r.open_days.includes(today)) return false
    if (!filters.priceRanges.includes(r.price_range)) return false
    if (filters.cuisines.length > 0 && !r.cuisine.some((c) => filters.cuisines.includes(c))) return false
    if (filters.tags.length > 0 && !r.tags.some((t) => filters.tags.includes(t))) return false
    if (filters.excludeRecentlyVisited && recentlyVisited.includes(r.id)) return false
    if (sessionStore.todayExclusions.includes(r.id)) return false
    return true
  }).length
})

function startDeciding() {
  const recentlyVisited = getRecentlyVisited()
  sessionStore.buildPool(restaurantsStore.visible, recentlyVisited)
  sessionStore.startBracket()
  router.push('/decide')
}
</script>
