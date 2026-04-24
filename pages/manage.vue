<template>
  <div class="flex flex-col min-h-full">
    <!-- Header -->
    <header class="px-4 pt-8 pb-4">
      <h1 class="text-2xl font-bold text-white">Manage List</h1>
      <p class="text-slate-400 text-sm mt-1">Toggle restaurants on or off</p>
    </header>

    <!-- Search -->
    <div class="px-4 pb-4">
      <div class="relative">
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
        />
        <input
          v-model="search"
          type="text"
          placeholder="Search by name or area..."
          class="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
        />
      </div>
    </div>

    <!-- Stats bar -->
    <div class="px-4 pb-3 flex gap-4 text-xs text-slate-500">
      <span>{{ activeCount }} active</span>
      <span>{{ disabledCount }} hidden</span>
    </div>

    <!-- Restaurant list -->
    <div class="flex-1 px-4 pb-6 overflow-y-auto space-y-3">
      <!-- Empty search result -->
      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div class="text-4xl">🔍</div>
        <p class="text-white font-semibold">No restaurants found</p>
        <p class="text-slate-400 text-sm">Try a different search term</p>
        <button
          class="text-orange-400 text-sm hover:text-orange-300"
          @click="search = ''"
        >
          Clear search
        </button>
      </div>

      <!-- Restaurant cards -->
      <div
        v-for="restaurant in filtered"
        :key="restaurant.id"
        class="rounded-xl border p-4 transition-all"
        :class="
          isActive(restaurant.id)
            ? 'bg-slate-800 border-slate-700'
            : 'bg-slate-900 border-slate-800 opacity-60'
        "
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-sm text-white truncate">{{ restaurant.name }}</h3>
              <!-- Recently visited badge -->
              <span
                v-if="isRecentlyVisited(restaurant.id)"
                class="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-medium"
              >
                Recent
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ restaurant.area }} · {{ restaurant.cuisine.slice(0, 2).join(', ') }} · {{ '$'.repeat(restaurant.price_range) }}
            </p>
            <!-- Last visited -->
            <p v-if="lastVisited(restaurant.id)" class="text-xs text-slate-500 mt-1">
              Last visited: {{ formatDate(lastVisited(restaurant.id)!) }}
            </p>
          </div>

          <!-- Toggle -->
          <button
            class="shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="isActive(restaurant.id) ? 'bg-orange-500' : 'bg-slate-700'"
            :aria-label="`Toggle ${restaurant.name}`"
            @click="toggleActive(restaurant.id)"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="isActive(restaurant.id) ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>

        <!-- Tags row -->
        <div class="flex flex-wrap gap-1 mt-2.5">
          <span
            v-for="tag in restaurant.tags"
            :key="tag"
            class="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400"
          >
            {{ tag }}
          </span>
          <span
            v-if="restaurant.meal.includes('lunch')"
            class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400"
          >
            lunch
          </span>
          <span
            v-if="restaurant.meal.includes('dinner')"
            class="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400"
          >
            dinner
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRestaurantsStore } from '~/stores/restaurants'
import { useVisitHistory } from '~/composables/useVisitHistory'

const restaurantsStore = useRestaurantsStore()
const { getLastVisited, isRecentlyVisited: checkRecent, getAllVisits } = useVisitHistory()

const search = ref('')
const allVisits = ref<Record<string, string>>({})

onMounted(() => {
  allVisits.value = getAllVisits()
})

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  return restaurantsStore.all.filter((r) => {
    if (!q) return true
    return r.name.toLowerCase().includes(q) || r.area.toLowerCase().includes(q)
  })
})

const activeCount = computed(() =>
  restaurantsStore.all.filter((r) => restaurantsStore.isActive(r.id)).length
)

const disabledCount = computed(() =>
  restaurantsStore.all.length - activeCount.value
)

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

function toggleActive(id: string) {
  const current = isActive(id)
  restaurantsStore.setActiveOverride(id, !current)
}
</script>
