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

    <!-- First-run onboarding hints -->
    <FirstRunHints />

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
        class="mt-2 inline-flex items-center justify-center gap-2 py-4 px-6 w-full max-w-xs rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-base transition-all active:scale-95"
      >
        <UIcon name="i-heroicons-list-bullet" class="w-5 h-5" aria-hidden="true" />
        Open My Places
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Hero CTA -->
      <div class="px-4">
        <button
          class="group w-full py-5 rounded-2xl font-bold text-xl text-white shadow-lg shadow-orange-500/20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 transition-all active:scale-95 disabled:opacity-50 disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none"
          :disabled="primaryDisabled"
          @click="onPrimaryCta"
        >
          <span class="inline-flex items-center gap-2">
            <template v-if="store.hasAreaSelection">
              <span>{{ areaCtaLabel }}</span>
            </template>
            <template v-else-if="!store.hasActiveFilters">
              <span
                class="text-2xl inline-block transition-transform duration-150 group-active:rotate-12"
                aria-hidden="true"
              >🎲</span>
              <span>Surprise Me</span>
            </template>
            <template v-else>
              <span>Pick one for me</span>
            </template>
          </span>
          <span class="block text-sm font-normal text-orange-100/90 mt-1">{{ ctaSubtitle }}</span>
        </button>
        <div v-if="store.hasAreaSelection" class="mt-2 flex justify-center">
          <button
            type="button"
            class="text-sm text-slate-300 underline-offset-2 hover:underline px-3 py-2 min-h-[44px]"
            @click="store.clearAreaSelection"
          >
            Clear {{ store.selectedAreas.length }} selected
          </button>
        </div>
        <p v-if="errorMessage" class="mt-3 text-center text-sm text-rose-300">
          {{ errorMessage }}
        </p>
        <Transition name="fade">
          <!-- Prominent clear-filters when nothing matches active filters -->
          <div
            v-if="(totalAvailable === 0 || (store.hasAreaSelection && selectedAvailable === 0)) && store.hasActiveFilters"
            key="clear"
          >
            <button
              class="mt-3 w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-orange-300 hover:border-orange-500/60 transition-all active:scale-95"
              @click="store.clearFilters"
            >
              Clear all filters
            </button>
            <button
              v-if="store.hasAreaSelection"
              class="mt-2 w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-orange-300 hover:border-orange-500/60 transition-all active:scale-95"
              @click="store.clearAreaSelection"
            >
              Clear area selection
            </button>
            <p
              v-if="relaxSuggestion"
              class="text-sm text-slate-400 mt-2 text-center"
            >
              Remove <span class="text-orange-300 font-medium">{{ relaxSuggestion.label }}</span>
              to see {{ relaxSuggestion.count }} place{{ relaxSuggestion.count !== 1 ? 's' : '' }}
            </p>
            <!-- Removable active-filter chips -->
            <div class="mt-3 flex flex-wrap gap-2 justify-center">
              <button
                v-for="chip in activeFilterChips"
                :key="chip.key"
                class="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm bg-slate-800 border border-slate-700 text-slate-300 hover:border-red-500/40"
                :aria-label="`Remove ${chip.label} filter`"
                @click="chip.remove()"
              >
                {{ chip.label }}
                <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Filter section (optional, collapsible) -->
      <section class="px-4 mt-6">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl px-4">
          <button
            class="w-full flex items-center justify-between py-3 text-base font-medium text-white"
            :aria-expanded="filtersOpen"
            aria-controls="refine-panel"
            @click="filtersOpen = !filtersOpen"
          >
            <span class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-adjustments-horizontal"
                class="w-5 h-5 text-orange-400"
                aria-hidden="true"
              />
              <span>Refine my pick</span>
              <span
                v-if="store.hasActiveFilters"
                class="text-sm px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30"
                aria-live="polite"
                aria-atomic="true"
              >
                {{ activeFilterCount }} active
              </span>
            </span>
            <UIcon
              name="i-heroicons-chevron-down"
              class="w-5 h-5 text-slate-400 transition-transform duration-200"
              :class="filtersOpen && 'rotate-180'"
              aria-hidden="true"
            />
          </button>

          <!-- Collapsed filter summary -->
          <p
            v-if="!filtersOpen && store.hasActiveFilters"
            class="pb-3 -mt-1 text-sm text-slate-400 line-clamp-2 leading-snug"
          >
            {{ store.filterSummary }}
          </p>
        </div>

        <Transition name="collapse">
          <div v-if="filtersOpen" id="refine-panel" class="mt-3 space-y-4 pb-2">
          <!-- Price -->
          <div>
            <h3 class="text-sm font-semibold text-slate-200 mb-2">Price</h3>
            <div class="flex gap-3">
              <button
                v-for="opt in priceOptions"
                :key="opt.value"
                class="flex-1 min-h-[48px] py-3 rounded-xl text-sm font-medium border transition-all active:scale-95"
                :class="
                  store.priceFilters.includes(opt.value)
                    ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                "
                :aria-pressed="store.priceFilters.includes(opt.value)"
                @click="store.togglePriceFilter(opt.value)"
              >
                <div class="font-bold inline-flex items-center justify-center gap-1">
                  <UIcon
                    v-if="store.priceFilters.includes(opt.value)"
                    name="i-heroicons-check"
                    class="w-4 h-4"
                    aria-hidden="true"
                  />
                  <span>{{ opt.symbol }}</span>
                </div>
                <div class="text-xs opacity-75">{{ opt.label }}</div>
              </button>
            </div>
          </div>

          <!-- With -->
          <div>
            <h3 class="text-sm font-semibold text-slate-200 mb-2">With</h3>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="opt in withOptions"
                :key="opt.value"
                class="min-h-[48px] px-4 py-2.5 rounded-full text-sm font-medium border transition-all active:scale-95 inline-flex items-center"
                :class="
                  store.withFilters.includes(opt.value)
                    ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                "
                :aria-pressed="store.withFilters.includes(opt.value)"
                @click="store.toggleWithFilter(opt.value)"
              >
                <UIcon
                  v-if="store.withFilters.includes(opt.value)"
                  name="i-heroicons-check"
                  class="w-4 h-4 mr-1"
                  aria-hidden="true"
                />
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Service / Ordering / Payment (compact 3-col grid; 2-col on narrow screens) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <h3 class="text-sm font-semibold text-slate-200 mb-2">Service</h3>
              <div class="flex flex-col gap-2">
                <button
                  v-for="opt in serviceOptions"
                  :key="opt.value"
                  class="w-full min-h-[48px] py-3 rounded-xl text-sm font-medium border transition-all active:scale-95 whitespace-nowrap inline-flex items-center justify-center"
                  :class="
                    store.serviceFilters.includes(opt.value)
                      ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  "
                  :aria-pressed="store.serviceFilters.includes(opt.value)"
                  @click="store.toggleServiceFilter(opt.value)"
                >
                  <UIcon
                    v-if="store.serviceFilters.includes(opt.value)"
                    name="i-heroicons-check"
                    class="w-4 h-4 mr-1"
                    aria-hidden="true"
                  />
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-slate-200 mb-2">Ordering</h3>
              <p class="text-xs text-slate-400 mb-2">Own dish each, or share dishes family-style</p>
              <div class="flex flex-col gap-2">
                <button
                  v-for="opt in orderingOptions"
                  :key="opt.value"
                  class="w-full min-h-[48px] py-3 rounded-xl text-sm font-medium border transition-all active:scale-95 whitespace-nowrap inline-flex items-center justify-center"
                  :class="
                    store.orderingFilters.includes(opt.value)
                      ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  "
                  :aria-pressed="store.orderingFilters.includes(opt.value)"
                  @click="store.toggleOrderingFilter(opt.value)"
                >
                  <UIcon
                    v-if="store.orderingFilters.includes(opt.value)"
                    name="i-heroicons-check"
                    class="w-4 h-4 mr-1"
                    aria-hidden="true"
                  />
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-slate-200 mb-2">Payment</h3>
              <p class="text-xs text-slate-400 mb-2">Split the bill, or one person pays</p>
              <div class="flex flex-col gap-2">
                <button
                  v-for="opt in payOptions"
                  :key="opt.value"
                  class="w-full min-h-[48px] py-3 rounded-xl text-sm font-medium border transition-all active:scale-95 whitespace-nowrap inline-flex items-center justify-center"
                  :class="
                    store.payFilters.includes(opt.value)
                      ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  "
                  :aria-pressed="store.payFilters.includes(opt.value)"
                  @click="store.togglePayFilter(opt.value)"
                >
                  <UIcon
                    v-if="store.payFilters.includes(opt.value)"
                    name="i-heroicons-check"
                    class="w-4 h-4 mr-1"
                    aria-hidden="true"
                  />
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Cuisine -->
          <div class="pt-4 mt-4 border-t border-slate-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-slate-200">
                Cuisine
                <span
                  v-if="store.cuisineFilters.length > 0"
                  class="text-orange-300 font-normal"
                >({{ store.cuisineFilters.length }})</span>
              </h3>
              <button
                v-if="store.cuisineFilters.length > 0"
                class="text-sm text-orange-400 hover:text-orange-300 px-2 py-1 -mr-2 -my-1"
                @click="store.cuisineFilters = []"
              >
                Clear
              </button>
            </div>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="cuisine in cuisines"
                :key="cuisine"
                class="min-h-[48px] px-4 py-3 rounded-full text-sm font-medium border transition-all active:scale-95 inline-flex items-center"
                :class="
                  store.cuisineFilters.includes(cuisine)
                    ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                "
                :aria-pressed="store.cuisineFilters.includes(cuisine)"
                @click="store.toggleCuisineFilter(cuisine)"
              >
                <UIcon
                  v-if="store.cuisineFilters.includes(cuisine)"
                  name="i-heroicons-check"
                  class="w-4 h-4 mr-1"
                  aria-hidden="true"
                />
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
        <div class="flex items-start justify-between mb-3 gap-3">
          <p class="text-base text-slate-200">
            Or pick specific places
            <span class="text-slate-400">(tap as many as you like)</span>
          </p>
          <p v-if="store.hasActiveFilters" class="text-sm text-slate-400 shrink-0">
            {{ totalAvailable }} {{ totalAvailable === 1 ? 'place' : 'places' }} match
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="area in sortedAreas"
            :key="area.name"
            class="relative flex flex-col items-start gap-1 p-4 rounded-2xl bg-slate-800 border border-slate-700 hover:border-orange-500/60 transition-all active:scale-95 text-left disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:active:scale-100"
            :class="
              store.selectedAreas.includes(area.name)
                ? 'ring-4 ring-orange-500 border-orange-500/60 bg-slate-800/90'
                : ''
            "
            :disabled="area.count === 0"
            :aria-pressed="store.selectedAreas.includes(area.name)"
            @click="onToggleArea(area.name)"
          >
            <UIcon
              v-if="store.selectedAreas.includes(area.name)"
              name="i-heroicons-check"
              class="absolute top-2 right-2 w-6 h-6 text-white bg-orange-500 rounded-full p-0.5"
              aria-hidden="true"
            />
            <div class="flex items-center gap-1.5 text-orange-400">
              <UIcon name="i-heroicons-map-pin" class="w-4 h-4" aria-hidden="true" />
            </div>
            <div
              class="font-bold leading-tight"
              :class="area.count === 0 ? 'text-slate-400' : 'text-white'"
            >
              {{ area.name }}
            </div>
            <div class="text-sm text-slate-400">
              {{ area.count }} {{ area.count === 1 ? 'place' : 'places' }}
            </div>
            <div
              v-if="area.count === 0 && store.hasActiveFilters"
              class="text-xs text-slate-500"
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

// Open the panel when filters first become active; close it again when cleared.
watch(
  () => store.hasActiveFilters,
  (next, prev) => {
    if (!prev && next) filtersOpen.value = true
    if (prev && !next) filtersOpen.value = false
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
  { value: 'shared' as const, label: 'Share dishes' },
]

const payOptions = [
  { value: 'split' as const, label: 'Everyone pays own' },
  { value: 'treat' as const, label: 'One pays' },
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
  shared: 'Share dishes',
}
const payLabelMap: Record<string, string> = {
  split: 'Everyone pays own',
  treat: 'One pays',
}

const activeFilterCount = computed(() => {
  let n = store.priceFilters.length + store.cuisineFilters.length
  n += store.withFilters.length
  n += store.orderingFilters.length
  n += store.payFilters.length
  n += store.serviceFilters.length
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

  for (const s of store.serviceFilters) {
    chips.push({
      key: `service:${s}`,
      label: serviceLabelMap[s] ?? s,
      remove: () => store.toggleServiceFilter(s),
    })
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

interface RelaxOption {
  label: string
  count: number
}

const relaxSuggestion = computed<RelaxOption | null>(() => {
  if (totalAvailable.value > 0 || !store.hasActiveFilters) return null

  // Snapshot current filters so we can swap one out at a time
  const original = {
    priceFilters: store.priceFilters,
    cuisineFilters: store.cuisineFilters,
    serviceFilters: store.serviceFilters,
    withFilters: store.withFilters,
    orderingFilters: store.orderingFilters,
    payFilters: store.payFilters,
  }

  const dimensions: { key: keyof typeof original, label: string, active: boolean }[] = [
    { key: 'priceFilters', label: 'Price', active: store.priceFilters.length > 0 },
    { key: 'withFilters', label: 'With', active: store.withFilters.length > 0 },
    { key: 'serviceFilters', label: 'Service', active: store.serviceFilters.length > 0 },
    { key: 'orderingFilters', label: 'Ordering', active: store.orderingFilters.length > 0 },
    { key: 'payFilters', label: 'Payment', active: store.payFilters.length > 0 },
    { key: 'cuisineFilters', label: 'Cuisine', active: store.cuisineFilters.length > 0 },
  ]

  let best: RelaxOption | null = null
  for (const dim of dimensions) {
    if (!dim.active) continue
    // Temporarily clear this dimension
    ;(store as unknown as Record<string, unknown[]>)[dim.key] = []
    const count = store.availableNow.length
    // Restore
    ;(store as unknown as Record<string, unknown[]>)[dim.key] = original[dim.key]
    if (count > 0 && (best === null || count > best.count)) {
      best = { label: dim.label, count }
    }
  }
  return best
})

const sortedAreas = computed<AreaEntry[]>(() => {
  // Include all known areas; show 0 for ones with no matches under current filters
  const counts = store.areaCounts
  return store.allAreas.map((name) => ({
    name,
    count: counts[name] ?? 0,
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})

const selectedAvailable = computed(() => {
  if (!store.hasAreaSelection) return totalAvailable.value
  return store.availableNow.filter((r) => store.selectedAreas.includes(r.area)).length
})

const primaryDisabled = computed(() => {
  if (store.hasAreaSelection) return selectedAvailable.value === 0
  return totalAvailable.value === 0
})

const areaCtaLabel = computed(() => {
  const sel = store.selectedAreas
  if (sel.length === 0) return ''
  if (sel.length === 1) return `Pick one from ${sel[0]}`
  if (sel.length === 2) return `Pick one from ${sel[0]} & ${sel[1]}`
  return `Pick one from ${sel[0]} & ${sel.length - 1} more`
})

const ctaSubtitle = computed(() => {
  if (store.hasAreaSelection) return 'Picks one place from these'
  if (store.hasActiveFilters) return 'Picks one place that matches your filters'
  return 'Picks one place at random'
})

function onSurpriseMe(): void {
  errorMessage.value = ''
  const pick = store.pickRandom()
  if (!pick) {
    errorMessage.value = 'No places match — try different filters'
    return
  }
  filtersOpen.value = false
  router.push('/result')
}

function onPrimaryCta(): void {
  if (!store.hasAreaSelection) {
    onSurpriseMe()
    return
  }
  errorMessage.value = ''
  const areas = store.selectedAreas.slice()
  const pick = store.pickRandom(areas)
  if (!pick) {
    errorMessage.value = areas.length === 1
      ? `Nothing in ${areas[0]} matches your filters`
      : 'Nothing in your selected areas matches your filters'
    return
  }
  filtersOpen.value = false
  router.push({ path: '/result', query: { areas: areas.join(',') } })
}

function onToggleArea(area: string): void {
  errorMessage.value = ''
  store.toggleAreaSelection(area)
}
</script>
