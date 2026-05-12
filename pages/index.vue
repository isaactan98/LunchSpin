<template>
  <div class="flex flex-col min-h-full bg-slate-950 text-white">
    <!-- Header -->
    <header class="px-4 pt-8 pb-4 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white tracking-tight">LunchSpin</h1>
      <div
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-sm text-slate-200"
      >
        <span>{{ mealIcon }}</span>
        <span class="capitalize">{{ meal }}</span>
      </div>
    </header>

    <!-- Hero CTA -->
    <div class="px-4">
      <button
        class="w-full py-5 rounded-3xl font-bold text-xl text-white shadow-lg shadow-orange-500/20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 transition-all active:scale-95 disabled:opacity-50 disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none"
        :disabled="totalAvailable === 0"
        @click="onSurpriseMe"
      >
        <span class="inline-flex items-center gap-2">
          <span class="text-2xl">🎲</span>
          <span>Surprise Me</span>
        </span>
      </button>
      <p v-if="errorMessage" class="mt-3 text-center text-sm text-amber-400">
        {{ errorMessage }}
      </p>
    </div>

    <!-- Filter section (optional, collapsible) -->
    <section class="px-4 mt-6">
      <button
        class="w-full flex items-center justify-between py-2 text-sm font-medium text-slate-300"
        @click="filtersOpen = !filtersOpen"
      >
        <span class="flex items-center gap-2">
          <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4 text-orange-400" />
          <span>Refine</span>
          <span
            v-if="store.hasActiveFilters"
            class="text-xs px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30"
          >
            {{ activeFilterCount }} active
          </span>
        </span>
        <UIcon
          :name="filtersOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          class="w-4 h-4 text-slate-400"
        />
      </button>

      <div v-if="filtersOpen" class="mt-3 space-y-4 pb-2">
        <!-- Price -->
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-500 mb-2">Price</p>
          <div class="flex gap-2">
            <button
              v-for="opt in priceOptions"
              :key="opt.value"
              class="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
              :class="
                store.priceFilters.includes(opt.value)
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
              "
              @click="store.togglePriceFilter(opt.value)"
            >
              <div class="font-bold">{{ opt.symbol }}</div>
              <div class="text-[10px] opacity-75">{{ opt.label }}</div>
            </button>
          </div>
        </div>

        <!-- Cuisine -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs uppercase tracking-wide text-slate-500">Cuisine</p>
            <button
              v-if="store.cuisineFilters.length > 0"
              class="text-xs text-orange-400 hover:text-orange-300"
              @click="store.cuisineFilters = []"
            >
              Clear
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cuisine in cuisines"
              :key="cuisine"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              :class="
                store.cuisineFilters.includes(cuisine)
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
              "
              @click="store.toggleCuisineFilter(cuisine)"
            >
              {{ cuisine }}
            </button>
          </div>
        </div>

        <button
          v-if="store.hasActiveFilters"
          class="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          @click="store.clearFilters"
        >
          Clear all filters
        </button>
      </div>
    </section>

    <!-- Location grid -->
    <section class="px-4 mt-6 pb-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-medium text-slate-400">Or pick a place:</h2>
        <p v-if="store.hasActiveFilters" class="text-xs text-slate-500">
          {{ totalAvailable }} {{ totalAvailable === 1 ? 'place' : 'places' }} match
        </p>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="area in sortedAreas"
          :key="area.name"
          class="flex flex-col items-start gap-1 p-4 rounded-2xl bg-slate-800 border border-slate-700 hover:border-orange-500/60 transition-all active:scale-95 text-left disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-700"
          :disabled="area.count === 0"
          @click="onPickArea(area.name)"
        >
          <div class="flex items-center gap-1.5 text-orange-400">
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
          </div>
          <div class="font-bold text-white leading-tight">{{ area.name }}</div>
          <div class="text-xs text-slate-400">
            {{ area.count }} {{ area.count === 1 ? 'place' : 'places' }}
          </div>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRestaurantsStore } from '~/stores/restaurants'

const router = useRouter()
const store = useRestaurantsStore()

const errorMessage = ref<string>('')
const filtersOpen = ref(false)

const meal = computed(() => store.currentMeal())
const mealIcon = computed(() => (meal.value === 'lunch' ? '☀️' : '🌙'))

const cuisines = computed(() => store.allCuisines)

const priceOptions = [
  { value: 1 as const, symbol: '$', label: 'Cheap' },
  { value: 2 as const, symbol: '$$', label: 'Mid' },
  { value: 3 as const, symbol: '$$$', label: 'Pricey' },
]

const activeFilterCount = computed(
  () => store.priceFilters.length + store.cuisineFilters.length,
)

const totalAvailable = computed(() => store.availableNow.length)

interface AreaEntry {
  name: string
  count: number
}

const sortedAreas = computed<AreaEntry[]>(() => {
  // Include all known areas; show 0 for ones with no matches under current filters
  const counts = store.areaCounts
  return store.allAreas.map((name) => ({
    name,
    count: counts[name] ?? 0,
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})

function onSurpriseMe(): void {
  errorMessage.value = ''
  const pick = store.pickRandom()
  if (!pick) {
    errorMessage.value = 'No places match — try different filters'
    return
  }
  router.push('/result')
}

function onPickArea(area: string): void {
  errorMessage.value = ''
  const pick = store.pickRandom(area)
  if (!pick) {
    errorMessage.value = `Nothing in ${area} matches your filters`
    return
  }
  router.push({ path: '/result', query: { area } })
}
</script>
