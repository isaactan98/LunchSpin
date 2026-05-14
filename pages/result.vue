<template>
  <div class="flex flex-col min-h-full bg-slate-950 text-white">
    <!-- Header -->
    <header class="px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4 flex items-center gap-3">
      <NuxtLink
        to="/"
        class="w-11 h-11 flex items-center justify-center rounded-full bg-slate-800/80 border border-slate-700 hover:bg-slate-800 transition-all active:scale-95"
        aria-label="Back"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 text-slate-200" aria-hidden="true" />
      </NuxtLink>
      <h1 class="text-xl font-bold tracking-tight">{{ headerTitle }}</h1>
    </header>

    <!-- Scope chip -->
    <Transition name="fade">
      <div v-if="scopeChip" :key="scopeChip" class="px-4 mb-3">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300"
        >
          <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
          <span>{{ scopeChip }}</span>
        </span>
      </div>
    </Transition>

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
            <p v-if="lastVisitedLabel" class="mt-1 text-xs text-slate-400">
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
            class="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/15 text-orange-300 border border-orange-500/30"
          >
            {{ c }}
          </span>
        </div>

        <!-- Context badges: only show narrowing ones -->
        <div v-if="contextBadges.length" class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="b in contextBadges"
            :key="b.label"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300"
          >
            <UIcon :name="b.icon" class="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            {{ b.label }}
          </span>
        </div>

        <!-- Open days (simplified) -->
        <p
          v-if="openDaysLine"
          class="mt-5 text-xs text-slate-400"
        >
          {{ openDaysLine }}
        </p>

        <!-- Meal badges -->
        <div class="mt-5 flex gap-2">
          <span
            v-if="restaurant.meal.includes('lunch')"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-700 text-slate-200"
          >
            <UIcon name="i-heroicons-sun" class="w-4 h-4 text-amber-400" aria-hidden="true" />
            Lunch
          </span>
          <span
            v-if="restaurant.meal.includes('dinner')"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-700 text-slate-200"
          >
            <UIcon name="i-heroicons-moon" class="w-4 h-4 text-slate-300" aria-hidden="true" />
            Dinner
          </span>
        </div>

        <!-- Tags -->
        <div
          v-if="restaurant.tags.length"
          class="mt-5 flex flex-wrap gap-2"
        >
          <span
            v-for="t in restaurant.tags"
            :key="t"
            class="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-900 text-slate-400 border border-slate-700"
          >
            #{{ t }}
          </span>
        </div>

        <!-- Notes -->
        <p
          v-if="restaurant.notes"
          class="mt-5 text-sm text-slate-400 italic leading-relaxed"
        >
          {{ restaurant.notes }}
        </p>
        </div>
      </Transition>

      <p
        v-if="inlineMessage"
        class="mt-4 text-center text-sm text-rose-300"
      >
        {{ inlineMessage }}
      </p>
    </main>

    <!-- Action buttons (in normal flow above bottom nav) -->
    <div v-if="restaurant" class="px-4 pt-3 pb-4 space-y-2.5">
      <button
        class="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg shadow-orange-500/30 bg-orange-500 hover:bg-orange-400 transition-all active:scale-95"
        @click="onLetsGo"
      >
        Let's Go! 🚀
      </button>
      <button
        class="w-full py-3.5 rounded-2xl font-semibold text-base text-slate-100 bg-slate-900 border border-slate-700 hover:border-orange-500/60 transition-all active:scale-95 inline-flex items-center justify-center gap-2"
        @click="onTryAnother"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-5 h-5 transition-transform duration-300"
          :class="rerolling && 'rotate-180'"
          aria-hidden="true"
        />
        Re-roll
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
const rerolling = ref(false)
const lastVisitedDate = ref<string | null>(null)

const areaParam = computed<string | undefined>(() => {
  const a = route.query.area
  if (typeof a === 'string' && a.length > 0) return a
  return undefined
})

const restaurant = computed(() =>
  restaurantsStore.all.find(r => r.id === restaurantsStore.lastPickedId) ?? null,
)

const headerTitle = computed(() => {
  const m = restaurantsStore.lastPickedMeal
  return m === 'dinner' ? "Tonight's pick" : 'Lunch pick'
})

const scopeChip = computed(() => {
  const filterText = restaurantsStore.filterSummary
  const area = areaParam.value
  if (!filterText && !area) return ''
  if (filterText && area) return `${filterText} · ${area}`
  if (filterText) return `${filterText} · anywhere`
  return `from ${area}`
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
  router.push('/')
}

function onTryAnother(): void {
  inlineMessage.value = ''
  rerolling.value = true
  const currentId = restaurantsStore.lastPickedId
  const pick = restaurantsStore.pickRandom(areaParam.value)
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
