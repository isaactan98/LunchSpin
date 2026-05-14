<template>
  <div class="flex flex-col min-h-full bg-slate-950">
    <!-- Header -->
    <header
      ref="headerEl"
      class="sticky top-0 z-20 bg-slate-950/80 backdrop-blur px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-4"
    >
      <h1 class="text-2xl font-bold text-white tracking-tight">Manage</h1>
      <p class="text-slate-400 text-sm mt-1">Toggle restaurants on/off</p>

      <!-- Search -->
      <div class="relative mt-4">
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          aria-hidden="true"
        />
        <input
          v-model="search"
          type="text"
          placeholder="Search by name or area..."
          class="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-base text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
        >
      </div>

      <!-- Filter tabs -->
      <div class="mt-3 flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="flex-1 px-3 py-2 rounded-full text-xs font-medium transition-colors border"
          :class="
            filterMode === tab.value
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          "
          @click="filterMode = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Stats line -->
      <p class="mt-3 text-xs text-slate-400">
        {{ activeCount }} active · {{ hiddenCount }} hidden
      </p>
    </header>

    <!-- Restaurant list grouped by area -->
    <div class="flex-1 px-4 pb-8">
      <!-- Skeleton placeholder while loading -->
      <div
        v-if="!restaurantsStore.loaded"
        class="space-y-3 pt-3"
        aria-hidden="true"
      >
        <div
          v-for="i in 4"
          :key="i"
          class="h-24 rounded-2xl bg-slate-800/50 animate-pulse"
        />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="grouped.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center gap-3"
      >
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="w-10 h-10 text-slate-500"
          aria-hidden="true"
        />
        <p class="text-white font-semibold">No restaurants found</p>
        <p class="text-slate-400 text-sm">Try a different search or filter</p>
        <button
          class="mt-2 text-orange-400 text-sm hover:text-orange-300"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>

      <!-- Grouped sections -->
      <section
        v-for="group in grouped"
        :key="group.area"
        class="mb-4"
      >
        <!-- Sticky area header (top offset bound to header height) -->
        <div
          class="sticky z-10 -mx-4 px-4 py-2 bg-slate-950 border-b border-slate-800"
          :style="{ top: stickyTop }"
        >
          <h2 class="text-xs font-semibold uppercase tracking-wide text-slate-300">
            {{ group.area }}
            <span class="text-slate-400 font-normal normal-case tracking-normal">· {{ group.items.length }}</span>
          </h2>
        </div>

        <!-- Cards -->
        <TransitionGroup name="list" tag="div" class="relative space-y-3 pt-3">
          <article
            v-for="restaurant in group.items"
            :key="restaurant.id"
            class="relative rounded-2xl border p-4 transition-all"
            :class="
              isActive(restaurant.id)
                ? 'bg-slate-800 border-slate-700'
                : 'bg-slate-900 border-slate-800'
            "
          >
            <!-- Badges -->
            <span
              v-if="isRecentlyVisited(restaurant.id)"
              class="absolute top-3 right-16 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-medium"
            >
              Recent
            </span>
            <span
              v-else-if="!isActive(restaurant.id)"
              class="absolute top-3 right-16 text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30 font-medium"
            >
              Hidden
            </span>

            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0 pr-2">
                <h3
                  class="font-bold truncate"
                  :class="isActive(restaurant.id) ? 'text-white' : 'text-slate-500'"
                >
                  {{ restaurant.name }}
                </h3>
                <p
                  class="text-xs mt-0.5"
                  :class="isActive(restaurant.id) ? 'text-slate-400' : 'text-slate-500'"
                >
                  {{ restaurant.cuisine.slice(0, 2).join(', ') }} · {{ '$'.repeat(restaurant.price_range) }}
                </p>

                <!-- Dimension icons (service / ordering) -->
                <div class="flex items-center gap-1.5 mt-1 text-slate-500">
                  <UIcon
                    v-if="restaurant.service.includes('dine-in')"
                    name="i-heroicons-home-modern"
                    class="w-4 h-4"
                    aria-hidden="true"
                  />
                  <UIcon
                    v-if="restaurant.service.includes('takeaway')"
                    name="i-heroicons-shopping-bag"
                    class="w-4 h-4"
                    aria-hidden="true"
                  />
                  <UIcon
                    v-if="restaurant.ordering_style === 'shared' || restaurant.ordering_style === 'both'"
                    name="i-heroicons-users"
                    class="w-4 h-4"
                    aria-hidden="true"
                  />
                </div>

                <!-- Tags (limit to 3) -->
                <div v-if="restaurant.tags.length" class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="tag in restaurant.tags.slice(0, 3)"
                    :key="tag"
                    class="text-xs px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-700"
                  >
                    {{ tag }}
                  </span>
                </div>

                <!-- Last visited -->
                <p
                  v-if="lastVisited(restaurant.id)"
                  class="text-xs text-slate-400 mt-2"
                >
                  Last visited: {{ formatDate(lastVisited(restaurant.id)!) }}
                </p>
              </div>

              <!-- Toggle (wrapped for ≥44px hit area) -->
              <button
                class="shrink-0 p-2 -m-2 inline-flex items-center justify-center"
                :aria-label="`Toggle ${restaurant.name}`"
                :aria-pressed="isActive(restaurant.id)"
                @click="toggleActive(restaurant.id)"
              >
                <span
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="isActive(restaurant.id) ? 'bg-orange-500' : 'bg-slate-700'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="isActive(restaurant.id) ? 'translate-x-6' : 'translate-x-1'"
                  />
                </span>
              </button>
            </div>
          </article>
        </TransitionGroup>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRestaurantsStore } from '~/stores/restaurants'
import { useVisitHistory } from '~/composables/useVisitHistory'


type FilterMode = 'all' | 'active' | 'hidden'

interface Restaurant {
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
  service: ('dine-in' | 'takeaway')[]
  ordering_style: 'individual' | 'shared' | 'both'
}

interface AreaGroup {
  area: string
  items: Restaurant[]
}

const restaurantsStore = useRestaurantsStore()
const { allVisits, isRecentlyVisited: checkRecent } = useVisitHistory()

const search = ref('')
const filterMode = ref<FilterMode>('all')
const headerEl = ref<HTMLElement | null>(null)
const headerHeight = ref(180)

const tabs: { value: FilterMode, label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'hidden', label: 'Hidden' },
]

const stickyTop = computed(() => `${headerHeight.value}px`)

function measureHeader(): void {
  if (headerEl.value) {
    headerHeight.value = headerEl.value.offsetHeight
  }
}

let resizeObs: ResizeObserver | null = null

onMounted(() => {
  measureHeader()
  if (headerEl.value && typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => measureHeader())
    resizeObs.observe(headerEl.value)
  }
  window.addEventListener('resize', measureHeader)
})

onBeforeUnmount(() => {
  if (resizeObs) resizeObs.disconnect()
  window.removeEventListener('resize', measureHeader)
})

function isActive(id: string): boolean {
  return restaurantsStore.isActive(id)
}

function isRecentlyVisited(id: string): boolean {
  return checkRecent(id)
}

function lastVisited(id: string): string | null {
  return allVisits.value[id] ?? null
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toggleActive(id: string): void {
  const current = isActive(id)
  restaurantsStore.setActiveOverride(id, !current)
}

function clearFilters(): void {
  search.value = ''
  filterMode.value = 'all'
}

const activeCount = computed(() =>
  restaurantsStore.all.filter(r => isActive(r.id)).length,
)

const hiddenCount = computed(() =>
  restaurantsStore.all.length - activeCount.value,
)

const filtered = computed<Restaurant[]>(() => {
  const q = search.value.toLowerCase().trim()
  return (restaurantsStore.all as Restaurant[]).filter((r) => {
    // Filter mode
    const active = isActive(r.id)
    if (filterMode.value === 'active' && !active) return false
    if (filterMode.value === 'hidden' && active) return false

    // Search
    if (!q) return true
    return (
      r.name.toLowerCase().includes(q)
      || r.area.toLowerCase().includes(q)
    )
  })
})

const grouped = computed<AreaGroup[]>(() => {
  const map = new Map<string, Restaurant[]>()
  for (const r of filtered.value) {
    if (!map.has(r.area)) map.set(r.area, [])
    map.get(r.area)!.push(r)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([area, items]) => ({
      area,
      items: items.slice().sort((a, b) => a.name.localeCompare(b.name)),
    }))
})
</script>
