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

    <!-- Skeleton placeholder while store is loading -->
    <div
      v-if="!store.loaded"
      class="px-4"
      aria-hidden="true"
    >
      <div class="w-full h-16 rounded-2xl bg-slate-800/50 animate-pulse" />
      <div class="grid grid-cols-2 gap-3 mt-6">
        <div v-for="i in 4" :key="i" class="h-24 rounded-2xl bg-slate-800/50 animate-pulse" />
      </div>
    </div>

    <!-- All-restaurants-hidden empty state -->
    <div
      v-else-if="noVisible"
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
          class="group w-full py-5 rounded-2xl font-bold text-xl text-white shadow-lg shadow-orange-500/20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 transition-all active:scale-95 disabled:opacity-50 disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none"
          :disabled="totalAvailable === 0"
          @click="onSurpriseMe"
        >
          <span class="inline-flex items-center gap-2">
            <template v-if="!store.hasActiveFilters">
              <span
                class="text-2xl inline-block transition-transform duration-150 group-active:rotate-12"
                aria-hidden="true"
              >🎲</span>
              <span>Surprise Me</span>
            </template>
            <template v-else>
              <span>Pick for me</span>
            </template>
          </span>
        </button>
        <p v-if="errorMessage" class="mt-3 text-center text-sm text-rose-300">
          {{ errorMessage }}
        </p>
        <Transition name="fade">
          <!-- Prominent clear-filters when nothing matches active filters -->
          <div v-if="totalAvailable === 0 && store.hasActiveFilters" key="clear">
            <button
              class="mt-3 w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-orange-300 hover:border-orange-500/60 transition-all active:scale-95"
              @click="store.clearFilters"
            >
              Clear all filters
            </button>
            <!-- Removable active-filter chips -->
            <div class="mt-3 flex flex-wrap gap-1.5 justify-center">
              <button
                v-for="chip in activeFilterChips"
                :key="chip.key"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-300 hover:border-red-500/40"
                :aria-label="`Remove ${chip.label} filter`"
                @click="chip.remove()"
              >
                {{ chip.label }}
                <UIcon name="i-heroicons-x-mark" class="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Filter section (optional, collapsible) -->
      <section class="px-4 mt-6">
        <button
          class="w-full flex items-center justify-between py-3 text-sm font-medium text-slate-300"
          :aria-expanded="filtersOpen"
          aria-controls="refine-panel"
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
              aria-live="polite"
              aria-atomic="true"
            >
              {{ activeFilterCount }} active
            </span>
          </span>
          <UIcon
            name="i-heroicons-chevron-down"
            class="w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="filtersOpen && 'rotate-180'"
            aria-hidden="true"
          />
        </button>

        <!-- Collapsed filter summary -->
        <p
          v-if="!filtersOpen && store.hasActiveFilters"
          class="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-snug"
        >
          {{ store.filterSummary }}
        </p>

        <Transition name="collapse">
          <div v-if="filtersOpen" id="refine-panel" class="mt-3 space-y-4 pb-2">
          <!-- Price -->
          <div>
            <h3 class="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5">Price</h3>
            <div class="flex gap-2">
              <button
                v-for="opt in priceOptions"
                :key="opt.value"
                class="flex-1 py-3 rounded-xl text-sm font-medium border transition-all active:scale-95"
                :class="
                  store.priceFilters.includes(opt.value)
                    ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                "
                :aria-pressed="store.priceFilters.includes(opt.value)"
                @click="store.togglePriceFilter(opt.value)"
              >
                <div class="font-bold">{{ opt.symbol }}</div>
                <div class="text-xs opacity-75">{{ opt.label }}</div>
              </button>
            </div>
          </div>

          <!-- With -->
          <div>
            <h3 class="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5">With</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in withOptions"
                :key="opt.value"
                class="px-3.5 py-2.5 rounded-full text-sm font-medium border transition-all active:scale-95"
                :class="
                  store.withFilters.includes(opt.value)
                    ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                "
                :aria-pressed="store.withFilters.includes(opt.value)"
                @click="store.toggleWithFilter(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Service / Ordering / Payment (compact 3-col grid) -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <h3 class="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5">Service</h3>
              <div class="flex flex-col gap-1.5">
                <button
                  v-for="opt in serviceOptions"
                  :key="opt.value"
                  class="w-full py-3 rounded-xl text-xs font-medium border transition-all active:scale-95 whitespace-nowrap"
                  :class="
                    store.serviceFilters.includes(opt.value)
                      ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  "
                  :aria-pressed="store.serviceFilters.includes(opt.value)"
                  @click="store.toggleServiceFilter(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <div>
              <h3
                class="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5"
                title="Individual = own dish · Shared = order dishes to share, 叫料吃"
              >
                Ordering
              </h3>
              <div class="flex flex-col gap-1.5">
                <button
                  v-for="opt in orderingOptions"
                  :key="opt.value"
                  class="w-full py-3 rounded-xl text-xs font-medium border transition-all active:scale-95 whitespace-nowrap"
                  :class="
                    store.orderingFilters.includes(opt.value)
                      ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  "
                  :aria-pressed="store.orderingFilters.includes(opt.value)"
                  @click="store.toggleOrderingFilter(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <div>
              <h3
                class="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5"
                title="How the bill is handled"
              >
                Payment
              </h3>
              <div class="flex flex-col gap-1.5">
                <button
                  v-for="opt in payOptions"
                  :key="opt.value"
                  class="w-full py-3 rounded-xl text-xs font-medium border transition-all active:scale-95 whitespace-nowrap"
                  :class="
                    store.payFilters.includes(opt.value)
                      ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  "
                  :aria-pressed="store.payFilters.includes(opt.value)"
                  @click="store.togglePayFilter(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Cuisine -->
          <div class="pt-4 mt-4 border-t border-slate-800">
            <div class="flex items-center justify-between mb-1.5">
              <h3 class="text-[11px] uppercase tracking-wide text-slate-400">Cuisine</h3>
              <button
                v-if="store.cuisineFilters.length > 0"
                class="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 -mr-2 -my-1"
                @click="store.cuisineFilters = []"
              >
                Clear
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cuisine in cuisines"
                :key="cuisine"
                class="px-3.5 py-3 rounded-full text-sm font-medium border transition-all active:scale-95"
                :class="
                  store.cuisineFilters.includes(cuisine)
                    ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                "
                :aria-pressed="store.cuisineFilters.includes(cuisine)"
                @click="store.toggleCuisineFilter(cuisine)"
              >
                {{ cuisine }}
              </button>
            </div>
          </div>

          <button
            v-if="store.hasActiveFilters"
            class="w-full py-3 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            @click="store.clearFilters"
          >
            Clear all filters
          </button>
          </div>
        </Transition>
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
            <div
              v-if="area.count === 0 && store.hasActiveFilters"
              class="text-[10px] text-slate-500"
            >
              Doesn't match filters
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
const filtersOpen = ref(store.hasActiveFilters)

// If filters get rehydrated after first render, auto-open the panel once.
watch(
  () => store.hasActiveFilters,
  (next, prev) => {
    if (!prev && next) filtersOpen.value = true
  },
)

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
  { value: 'colleague' as const, label: 'Work lunch' },
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
  colleague: 'Work lunch',
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
const noVisible = computed(() => store.loaded && store.visible.length === 0)

interface FilterChip {
  key: string
  label: string
  remove: () => void
}

const activeFilterChips = computed<FilterChip[]>(() => {
  const chips: FilterChip[] = []

  for (const p of store.priceFilters.slice().sort((a, b) => a - b)) {
    chips.push({
      key: `price:${p}`,
      label: '$'.repeat(p),
      remove: () => store.togglePriceFilter(p),
    })
  }

  for (const w of store.withFilters) {
    chips.push({
      key: `with:${w}`,
      label: withLabelMap[w] ?? w,
      remove: () => store.toggleWithFilter(w),
    })
  }

  // Service is only "active" when it's not the default (both)
  if (store.serviceFilters.length !== 2) {
    for (const s of store.serviceFilters) {
      chips.push({
        key: `service:${s}`,
        label: serviceLabelMap[s] ?? s,
        // Re-add the missing service mode to restore default (avoid empty state)
        remove: () => {
          const other: 'dine-in' | 'takeaway' = s === 'dine-in' ? 'takeaway' : 'dine-in'
          if (!store.serviceFilters.includes(other)) store.toggleServiceFilter(other)
          store.toggleServiceFilter(s)
        },
      })
    }
  }

  for (const o of store.orderingFilters) {
    chips.push({
      key: `ordering:${o}`,
      label: orderingLabelMap[o] ?? o,
      remove: () => store.toggleOrderingFilter(o),
    })
  }

  for (const p of store.payFilters) {
    chips.push({
      key: `pay:${p}`,
      label: payLabelMap[p] ?? p,
      remove: () => store.togglePayFilter(p),
    })
  }

  for (const c of store.cuisineFilters) {
    chips.push({
      key: `cuisine:${c}`,
      label: c,
      remove: () => store.toggleCuisineFilter(c),
    })
  }

  return chips
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
