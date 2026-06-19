<template>
  <div class="flex flex-col min-h-full bg-slate-950 text-white">
    <!-- Header -->
    <header class="px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4 flex items-center gap-3">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 h-12 px-4 rounded-full bg-slate-800 border border-slate-700 active:scale-95"
        aria-label="Back"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 text-slate-200" aria-hidden="true" />
        <span class="text-base font-medium">Back</span>
      </NuxtLink>
      <h1 class="text-xl font-bold tracking-tight">{{ headerTitle }}</h1>
    </header>

    <!-- Scope chip — clickable × clears scope when areas are present -->
    <Transition name="fade">
      <div v-if="scopeChipText" :key="scopeChipText" class="px-4 mb-3">
        <span
          v-if="!hasAreaScope"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-sm text-slate-300"
        >
          <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
          <span>{{ scopeChipText }}</span>
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-sm text-slate-300"
        >
          <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
          <span>{{ scopeChipText }}</span>
          <button
            type="button"
            class="shrink-0 ml-1 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors min-h-[28px] min-w-[28px] inline-flex items-center justify-center"
            aria-label="Clear area scope"
            @click="onClearScope"
          >
            <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </span>
      </div>
    </Transition>

    <div v-if="metaLine" class="px-4 mb-3 flex justify-center">
      <span class="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 bg-slate-800/60 border border-slate-700 rounded-full px-4 py-1.5 text-sm text-slate-300 text-center">
        <span>{{ metaLine }}</span>
        <button
          v-if="canIncludeRecents"
          type="button"
          class="text-orange-300 hover:text-orange-200 underline-offset-2 hover:underline font-medium"
          @click="onIncludeRecents"
        >
          Include them
        </button>
      </span>
    </div>

    <!-- Main content -->
    <main class="flex-1 px-4 pb-4">
      <Transition name="reroll" mode="out-in">
        <div
          v-if="restaurant"
          :key="restaurant.id"
          class="rounded-2xl bg-slate-800 border border-slate-700 p-5 shadow-2xl shadow-orange-500/15"
        >
        <!-- Name + price -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold text-white leading-tight break-words">
              {{ restaurant.name }}
            </h2>
            <p class="mt-1 text-sm text-slate-400 flex items-center gap-1">
              <UIcon name="i-heroicons-map-pin" class="w-4 h-4" aria-hidden="true" />
              <span v-if="restaurant.mall">{{ restaurant.mall }} · {{ restaurant.area }}</span>
              <span v-else>{{ restaurant.area }}</span>
            </p>
            <p v-if="lastVisitedLabel" class="mt-1 text-sm text-slate-400">
              {{ lastVisitedLabel }}
            </p>
          </div>
          <div class="text-orange-400 text-xl font-bold shrink-0">
            {{ priceLabel }}
          </div>
        </div>

        <!-- Cuisine chips -->
        <div
          v-if="restaurant.cuisine.length"
          class="mt-4 flex flex-wrap gap-2"
        >
          <span
            v-for="c in restaurant.cuisine"
            :key="c"
            class="px-2.5 py-1 rounded-full text-sm font-medium bg-orange-500/15 text-orange-300 border border-orange-500/30"
          >
            {{ c }}
          </span>
        </div>

        <!-- Details disclosure: badges, open-days, tags, notes -->
        <details
          v-if="hasDetails"
          class="mt-4 group"
        >
          <summary
            class="text-sm text-slate-400 cursor-pointer inline-flex items-center gap-1 list-none [&::-webkit-details-marker]:hidden select-none"
          >
            Details
            <UIcon
              name="i-heroicons-chevron-down"
              class="w-4 h-4 transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div class="mt-3 space-y-4">
            <!-- Context badges -->
            <div v-if="contextBadges.length" class="flex flex-wrap gap-2">
              <span
                v-for="b in contextBadges"
                :key="b.label"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium bg-slate-900 border border-slate-700 text-slate-300"
              >
                <UIcon :name="b.icon" class="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                {{ b.label }}
              </span>
            </div>

            <!-- Open days -->
            <p v-if="openDaysLine" class="text-sm text-slate-400">
              {{ openDaysLine }}
            </p>

            <!-- Meal badges -->
            <div class="flex gap-2">
              <span
                v-if="restaurant.meal.includes('lunch')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-900 border border-slate-700 text-slate-200"
              >
                <UIcon name="i-heroicons-sun" class="w-4 h-4 text-amber-400" aria-hidden="true" />
                Lunch
              </span>
              <span
                v-if="restaurant.meal.includes('dinner')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-900 border border-slate-700 text-slate-200"
              >
                <UIcon name="i-heroicons-moon" class="w-4 h-4 text-slate-300" aria-hidden="true" />
                Dinner
              </span>
            </div>

            <!-- Tags -->
            <div
              v-if="restaurant.tags.length"
              class="flex flex-wrap gap-2"
            >
              <span
                v-for="t in restaurant.tags"
                :key="t"
                class="px-2 py-0.5 rounded-md text-sm font-medium bg-slate-900 text-slate-400 border border-slate-700"
              >
                #{{ t }}
              </span>
            </div>

            <!-- Notes -->
            <p
              v-if="restaurant.notes"
              class="text-sm text-slate-400 italic leading-relaxed"
            >
              {{ restaurant.notes }}
            </p>
          </div>
        </details>
        </div>
      </Transition>

      <div
        v-if="inlineMessage"
        class="mt-4 flex justify-center"
      >
        <span
          v-if="inlineMessageTone === 'success'"
          class="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-2 rounded-full text-sm"
        >
          <UIcon name="i-heroicons-check" class="w-4 h-4" aria-hidden="true" />
          {{ inlineMessage }}
        </span>
        <span
          v-else
          class="text-center text-sm text-rose-300"
        >
          {{ inlineMessage }}
        </span>
      </div>
    </main>

    <!-- Two-action footer -->
    <div v-if="restaurant" class="px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2.5">
      <button
        class="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg shadow-orange-500/30 bg-orange-500 hover:bg-orange-400 transition-all active:scale-95"
        @click="onLetsGo"
      >
        Let's Go! 🚀
      </button>
      <button
        class="w-full py-4 rounded-2xl font-semibold text-lg text-slate-100 bg-slate-900 border border-slate-700 hover:border-orange-500/60 transition-all active:scale-95 inline-flex items-center justify-center gap-2"
        @click="onTryAnother"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-5 h-5 transition-transform duration-300"
          :class="rerolling && 'rotate-180'"
          aria-hidden="true"
        />
        Spin again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRestaurantsStore } from '~/stores/restaurants'
import { useVisitHistory } from '~/composables/useVisitHistory'

const router = useRouter()
const route = useRoute()
const restaurantsStore = useRestaurantsStore()
const { markVisited, getLastVisited, isRecentlyVisited } = useVisitHistory()

const inlineMessage = ref<string>('')
const inlineMessageTone = ref<'error' | 'success'>('error')
const rerolling = ref(false)
const lastVisitedDate = ref<string | null>(null)

const areaParam = computed<string | undefined>(() => {
  const a = route.query.area
  if (typeof a === 'string' && a.length > 0) return a
  return undefined
})

const selectedAreasFromRoute = computed<string[]>(() => {
  const raw = route.query.areas
  if (typeof raw === 'string' && raw.length > 0) {
    return raw.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
  }
  // Backward compat: legacy single-area param
  if (areaParam.value) return [areaParam.value]
  return []
})

const hasAreaScope = computed(() => selectedAreasFromRoute.value.length > 0)

const restaurant = computed(() =>
  restaurantsStore.all.find(r => r.id === restaurantsStore.lastPickedId) ?? null,
)

const headerTitle = computed(() => {
  const m = restaurantsStore.lastPickedMeal
  return m === 'dinner' ? "Tonight's pick" : 'Lunch pick'
})

const areaScopeText = computed(() => {
  const areas = selectedAreasFromRoute.value
  if (areas.length === 0) return ''
  if (areas.length === 1) return areas[0]
  return areas.join(', ')
})

// Single text string for the chip body. The × is rendered separately.
const scopeChipText = computed(() => {
  const filterText = restaurantsStore.filterSummary
  const areas = areaScopeText.value
  if (!filterText && !areas) return ''
  if (filterText && areas) return `${filterText} · from ${areas}`
  if (filterText) return `${filterText} + anywhere`
  return `From ${areas}`
})

interface ContextBadge {
  label: string
  icon: string
}

const contextBadges = computed<ContextBadge[]>(() => {
  const r = restaurant.value
  if (!r) return []
  const badges: ContextBadge[] = []

  // Service: only one mode → narrowing
  if (r.service.length === 1) {
    if (r.service[0] === 'dine-in') {
      badges.push({ label: 'Dine-in only', icon: 'i-heroicons-home-modern' })
    } else {
      badges.push({ label: 'Takeaway only', icon: 'i-heroicons-shopping-bag' })
    }
  }

  // Ordering style: shared always informative, individual only if user filtered
  if (r.ordering_style === 'shared') {
    badges.push({ label: 'Shared dining', icon: 'i-heroicons-users' })
  } else if (
    r.ordering_style === 'individual'
    && restaurantsStore.orderingFilters.length > 0
  ) {
    badges.push({ label: 'Individual orders', icon: 'i-heroicons-user' })
  }

  // Pay style
  if (r.pay_style === 'treat') {
    badges.push({ label: 'Treat-worthy', icon: 'i-heroicons-banknotes' })
  }

  // Suitable-for: only one value → narrowing
  if (r.suitable_for.length === 1) {
    const v = r.suitable_for[0]
    const labelMap: Record<string, string> = {
      solo: 'Solo',
      date: 'Date',
      colleague: 'Work lunch',
      family: 'Family',
    }
    badges.push({ label: `Best for ${labelMap[v] ?? v}`, icon: 'i-heroicons-sparkles' })
  }

  return badges.slice(0, 4)
})

const priceLabel = computed(() => {
  if (!restaurant.value) return ''
  return '$'.repeat(restaurant.value.price_range)
})

const onlyOneMatch = computed(() => {
  if (!restaurantsStore.hasActiveFilters) return false
  return restaurantsStore.availableNow.length === 1
})

const skippedRecentCount = computed(() => restaurantsStore.lastPickSkippedRecent)

// Show "Include them" only when we actually skipped recents this pick AND
// the user hasn't already opted in.
const canIncludeRecents = computed(
  () => skippedRecentCount.value > 0 && !restaurantsStore.ignoreRecentThisSession,
)

const metaLine = computed<string | null>(() => {
  // Prefer the more-actionable single-match message when both signals fire
  if (onlyOneMatch.value) return 'Only 1 place matches your filters'
  const skipped = skippedRecentCount.value
  if (skipped > 0) {
    return `Skipped ${skipped} place${skipped !== 1 ? 's' : ''} you've been to this week`
  }
  return null
})

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const DAY_LABELS: Record<typeof DAY_KEYS[number], string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
}

const openDaysLine = computed(() => {
  if (!restaurant.value) return ''
  const openSet = new Set<string>()
  for (const d of restaurant.value.open_days) {
    const lower = d.toLowerCase()
    for (const k of DAY_KEYS) {
      if (lower.startsWith(k)) {
        openSet.add(k)
        break
      }
    }
  }
  if (openSet.size === 7) return ''
  // Determine today's key
  const jsDay = new Date().getDay() // 0=Sun..6=Sat
  const todayKey = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const)[jsDay]
  const others = DAY_KEYS.filter((k) => k !== todayKey && openSet.has(k)).map((k) => DAY_LABELS[k])
  if (others.length === 0) return 'Open today only'
  return `Open today · also ${others.join(', ')}`
})

const lastVisitedLabel = computed(() => {
  if (!restaurant.value || !lastVisitedDate.value) return ''
  if (!isRecentlyVisited(restaurant.value.id)) return ''
  const last = new Date(lastVisitedDate.value)
  const now = new Date()
  // Strip time portions
  const lastDay = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate())
  const todayDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const diff = Math.round((todayDay - lastDay) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return 'Last visited today'
  if (diff === 1) return 'Last visited 1 day ago'
  return `Last visited ${diff} days ago`
})

const hasDetails = computed(() => {
  const r = restaurant.value
  if (!r) return false
  return (
    contextBadges.value.length > 0
    || openDaysLine.value.length > 0
    || r.meal.length > 0
    || r.tags.length > 0
    || !!r.notes
  )
})

function refreshLastVisited(): void {
  if (!restaurant.value) {
    lastVisitedDate.value = null
    return
  }
  lastVisitedDate.value = getLastVisited(restaurant.value.id)
}

function onLetsGo(): void {
  if (!restaurant.value) return
  const r = restaurant.value
  const q = encodeURIComponent(`${r.name} ${r.mall ?? ''} ${r.area} Singapore`.trim().replace(/\s+/g, ' '))
  const url = `https://www.google.com/maps/search/?api=1&query=${q}`
  markVisited(r.id)
  if (import.meta.client) {
    window.open(url, '_blank')
  }
  // Refresh "last visited" inline (now today) and flash a brief saved confirmation.
  refreshLastVisited()
  inlineMessageTone.value = 'success'
  inlineMessage.value = 'Saved to recent visits'
  setTimeout(() => {
    if (inlineMessage.value === 'Saved to recent visits') inlineMessage.value = ''
  }, 1800)
}

function onClearScope(): void {
  inlineMessage.value = ''
  inlineMessageTone.value = 'error'
  rerolling.value = true
  const pick = restaurantsStore.pickRandom()
  if (!pick) {
    inlineMessage.value = 'No places match your filters'
  }
  refreshLastVisited()
  // Drop the ?areas= so subsequent re-rolls also widen scope
  router.replace({ path: '/result' })
  setTimeout(() => {
    rerolling.value = false
  }, 300)
}

function onIncludeRecents(): void {
  restaurantsStore.ignoreRecentThisSession = true
  // Re-pick immediately so the user sees the effect
  inlineMessage.value = ''
  inlineMessageTone.value = 'error'
  rerolling.value = true
  const areas = selectedAreasFromRoute.value
  const pick = areas.length > 0
    ? restaurantsStore.pickRandom(areas)
    : restaurantsStore.pickRandom()
  if (!pick) {
    inlineMessage.value = 'No places match your filters'
  }
  refreshLastVisited()
  setTimeout(() => {
    rerolling.value = false
  }, 300)
}

function onTryAnother(): void {
  inlineMessage.value = ''
  inlineMessageTone.value = 'error'
  rerolling.value = true
  const currentId = restaurantsStore.lastPickedId
  const areas = selectedAreasFromRoute.value
  const pick = areas.length > 0
    ? restaurantsStore.pickRandom(areas)
    : restaurantsStore.pickRandom()
  if (!pick) {
    inlineMessage.value = "That's the only option here!"
  } else if (pick.id === currentId) {
    inlineMessage.value = "That's the only option here!"
  }
  refreshLastVisited()
  setTimeout(() => {
    rerolling.value = false
  }, 300)
}

watch(
  () => restaurantsStore.lastPickedId,
  () => {
    refreshLastVisited()
  },
)

onMounted(() => {
  if (!restaurantsStore.lastPickedId) {
    router.replace('/')
    return
  }
  refreshLastVisited()
})
</script>

<style scoped></style>
