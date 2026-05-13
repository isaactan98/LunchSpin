<template>
  <div class="flex flex-col min-h-full bg-slate-950 text-white">
    <!-- Header -->
    <header class="px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-white tracking-tight">LunchSpin</h1>
      <div
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-sm text-slate-200"
      >
        <span aria-hidden="true">{{ mealIcon }}</span>
        <span class="capitalize">{{ meal }}</span>
      </div>
    </header>

    <!-- iOS install hint -->
    <IosInstallHint />

    <!-- All-restaurants-hidden empty state -->
    <div
      v-if="noVisible"
      class="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center gap-4"
    >
      <UIcon name="i-heroicons-eye-slash" class="w-12 h-12 text-slate-500" aria-hidden="true" />
      <p class="text-lg font-semibold text-white">All restaurants are hidden</p>
      <p class="text-sm text-slate-400">
        Turn some back on to start spinning.
      </p>
      <NuxtLink
        to="/manage"
        class="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-all active:scale-95"
      >
        <UIcon name="i-heroicons-list-bullet" class="w-4 h-4" aria-hidden="true" />
        Open Manage
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Hero CTA -->
      <div class="px-4">
        <button
          class="w-full py-5 rounded-2xl font-bold text-xl text-white shadow-lg shadow-orange-500/20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 transition-all active:scale-95 disabled:opacity-50 disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none"
          :disabled="totalAvailable === 0"
          @click="onSurpriseMe"
        >
          <span class="inline-flex items-center gap-2">
            <span class="text-2xl" aria-hidden="true">🎲</span>
            <span>Surprise Me</span>
          </span>
        </button>
        <p v-if="errorMessage" class="mt-3 text-center text-sm text-amber-400">
          {{ errorMessage }}
        </p>
        <!-- Prominent clear-filters when nothing matches active filters -->
        <button
          v-if="totalAvailable === 0 && store.hasActiveFilters"
          class="mt-3 w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-orange-300 hover:border-orange-500/60 transition-all active:scale-95"
          @click="store.clearFilters"
        >
          Clear filters
        </button>
      </div>

      <!-- Filter section (optional, collapsible) -->
      <section class="px-4 mt-6">
        <button
          class="w-full flex items-center justify-between py-2 text-sm font-medium text-slate-300"
          @click="filtersOpen = !filtersOpen"
        >
          <span class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-adjustments-horizontal"
              class="w-4 h-4 text-orange-400"
              aria-hidden="true"
            />
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
            aria-hidden="true"
          />
        </button>

        <!-- Collapsed filter summary -->
        <p
          v-if="!filtersOpen && store.hasActiveFilters"
          class="mt-1 text-xs text-slate-400 truncate"
        >
          {{ filterSummary }}
        </p>

        <div v-if="filtersOpen" class="mt-3 space-y-4 pb-2">
          <!-- Price -->
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400 mb-2">Price</p>
            <div class="flex gap-2">
              <button
                v-for="opt in priceOptions"
                :key="opt.value"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                :class="
                  store.priceFilters.includes(opt.value)
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                "
                @click="store.togglePriceFilter(opt.value)"
              >
                <div class="font-bold">{{ opt.symbol }}</div>
                <div class="text-xs opacity-75">{{ opt.label }}</div>
              </button>
            </div>
          </div>

          <!-- With -->
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400 mb-2">With</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in withOptions"
                :key="opt.value"
                class="px-3 py-2 rounded-full text-xs font-medium border transition-all"
                :class="
                  store.withFilters.includes(opt.value)
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                "
                @click="store.toggleWithFilter(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Service -->
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400 mb-2">Service</p>
            <div class="flex gap-2">
              <button
                v-for="opt in serviceOptions"
                :key="opt.value"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                :class="
                  store.serviceFilters.includes(opt.value)
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                "
                @click="store.toggleServiceFilter(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Ordering -->
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400 mb-2">Ordering</p>
            <div class="flex gap-2">
              <button
                v-for="opt in orderingOptions"
                :key="opt.value"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                :class="
                  store.orderingFilters.includes(opt.value)
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                "
                @click="store.toggleOrderingFilter(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Payment -->
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400 mb-2">Payment</p>
            <div class="flex gap-2">
              <button
                v-for="opt in payOptions"
                :key="opt.value"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                :class="
                  store.payFilters.includes(opt.value)
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                "
                @click="store.togglePayFilter(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Cuisine -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs uppercase tracking-wide text-slate-400">Cuisine</p>
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
                class="px-3 py-2.5 rounded-full text-xs font-medium border transition-all"
                :class="
                  store.cuisineFilters.includes(cuisine)
                    ? 'bg-orange-500 border-orange-500 text-white'
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
          <p v-if="store.hasActiveFilters" class="text-xs text-slate-400">
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
              <UIcon name="i-heroicons-map-pin" class="w-4 h-4" aria-hidden="true" />
            </div>
            <div
              class="font-bold leading-tight"
              :class="area.count === 0 ? 'text-slate-400' : 'text-white'"
            >
              {{ area.name }}
            </div>
            <div class="text-xs text-slate-400">
              {{ area.count }} {{ area.count === 1 ? 'place' : 'places' }}
            </div>
          </button>
        </div>
      </section>
    </template>
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

const withOptions = [
  { value: 'solo' as const, label: 'Solo' },
  { value: 'date' as const, label: 'Date' },
  { value: 'colleague' as const, label: 'Colleague' },
  { value: 'family' as const, label: 'Family' },
]

const serviceOptions = [
  { value: 'dine-in' as const, label: 'Dine-in' },
  { value: 'takeaway' as const, label: 'Takeaway' },
]

const orderingOptions = [
  { value: 'individual' as const, label: 'Individual' },
  { value: 'shared' as const, label: 'Shared (叫料吃)' },
]

const payOptions = [
  { value: 'split' as const, label: 'Split' },
  { value: 'treat' as const, label: 'Treat' },
]

const withLabelMap: Record<string, string> = {
  solo: 'Solo',
  date: 'Date',
  colleague: 'Colleague',
  family: 'Family',
}
const serviceLabelMap: Record<string, string> = {
  'dine-in': 'Dine-in',
  'takeaway': 'Takeaway',
}
const orderingLabelMap: Record<string, string> = {
  individual: 'Individual',
  shared: 'Shared',
}
const payLabelMap: Record<string, string> = {
  split: 'Split',
  treat: 'Treat',
}

const activeFilterCount = computed(() => {
  let n = store.priceFilters.length + store.cuisineFilters.length
  n += store.withFilters.length
  n += store.orderingFilters.length
  n += store.payFilters.length
  // Service counts only if not the default-both state
  if (store.serviceFilters.length !== 2) n += store.serviceFilters.length
  return n
})

const totalAvailable = computed(() => store.availableNow.length)
const noVisible = computed(() => store.visible.length === 0)

const filterSummary = computed(() => {
  const parts: string[] = []
  if (store.priceFilters.length > 0) {
    parts.push(
      store.priceFilters
        .slice()
        .sort((a, b) => a - b)
        .map((p) => '$'.repeat(p))
        .join('/'),
    )
  }
  if (store.withFilters.length > 0) {
    parts.push(store.withFilters.map((w) => withLabelMap[w]).join('/'))
  }
  if (store.serviceFilters.length !== 2) {
    parts.push(store.serviceFilters.map((s) => serviceLabelMap[s]).join('/'))
  }
  if (store.orderingFilters.length > 0) {
    parts.push(store.orderingFilters.map((o) => orderingLabelMap[o]).join('/'))
  }
  if (store.payFilters.length > 0) {
    parts.push(store.payFilters.map((p) => payLabelMap[p]).join('/'))
  }
  if (store.cuisineFilters.length > 0) {
    parts.push(store.cuisineFilters.join(', '))
  }
  return parts.join(' · ')
})

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
