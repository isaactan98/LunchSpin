<template>
  <div class="flex flex-col min-h-full bg-slate-950 text-white">
    <!-- Header -->
    <header class="px-4 pt-6 pb-4 flex items-center gap-3">
      <NuxtLink
        to="/"
        class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/80 border border-slate-700 hover:bg-slate-800 transition-all active:scale-95"
        aria-label="Back"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 text-slate-200" />
      </NuxtLink>
      <h1 class="text-xl font-bold tracking-tight">{{ headerTitle }}</h1>
    </header>

    <!-- Scope chip -->
    <div class="px-4 mb-3">
      <span
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300"
      >
        <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-orange-400" />
        <span>from {{ scopeLabel }}</span>
      </span>
    </div>

    <!-- Main content -->
    <main class="flex-1 px-4 pb-4">
      <div
        v-if="restaurant"
        class="rounded-2xl bg-slate-800 border border-slate-700 p-5 shadow-lg shadow-black/30"
      >
        <!-- Name + price -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold text-white leading-tight break-words">
              {{ restaurant.name }}
            </h2>
            <p class="mt-1 text-sm text-slate-400 flex items-center gap-1">
              <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
              <span v-if="restaurant.mall">{{ restaurant.mall }} · {{ restaurant.area }}</span>
              <span v-else>{{ restaurant.area }}</span>
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

        <!-- Open days -->
        <div class="mt-5">
          <p class="text-xs uppercase tracking-wide text-slate-500 mb-2">
            Open days
          </p>
          <div class="flex gap-1.5">
            <div
              v-for="(d, i) in dayLetters"
              :key="i"
              :class="[
                'w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold',
                isDayOpen(i)
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-900 text-slate-600 border border-slate-700',
              ]"
            >
              {{ d }}
            </div>
          </div>
        </div>

        <!-- Meal badges -->
        <div class="mt-5 flex gap-2">
          <span
            v-if="restaurant.meal.includes('lunch')"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-700 text-amber-300"
          >
            <UIcon name="i-heroicons-sun" class="w-4 h-4" />
            Lunch
          </span>
          <span
            v-if="restaurant.meal.includes('dinner')"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-700 text-indigo-300"
          >
            <UIcon name="i-heroicons-moon" class="w-4 h-4" />
            Dinner
          </span>
        </div>

        <!-- Tags -->
        <div
          v-if="restaurant.tags.length"
          class="mt-5 flex flex-wrap gap-1.5"
        >
          <span
            v-for="t in restaurant.tags"
            :key="t"
            class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900 text-slate-400 border border-slate-700"
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

      <p
        v-if="inlineMessage"
        class="mt-4 text-center text-sm text-amber-400"
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
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5" />
        Try Another 🔄
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
const { markVisited } = useVisitHistory()

const inlineMessage = ref<string>('')

const areaParam = computed<string | undefined>(() => {
  const a = route.query.area
  if (typeof a === 'string' && a.length > 0) return a
  return undefined
})

const restaurant = computed(() =>
  restaurantsStore.all.find(r => r.id === restaurantsStore.lastPickedId) ?? null,
)

const isLunch = computed(() => new Date().getHours() < 15)

const headerTitle = computed(() =>
  isLunch.value ? 'Lunch pick' : "Tonight's pick",
)

const scopeLabel = computed(() => areaParam.value ?? 'anywhere')

const priceLabel = computed(() => {
  if (!restaurant.value) return ''
  return '$'.repeat(restaurant.value.price_range)
})

const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const
const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

function isDayOpen(index: number): boolean {
  if (!restaurant.value) return false
  const key = dayKeys[index]
  return restaurant.value.open_days.some(d => d.toLowerCase().startsWith(key))
}

function onLetsGo(): void {
  if (!restaurant.value) return
  markVisited(restaurant.value.id)
  router.push('/')
}

function onTryAnother(): void {
  inlineMessage.value = ''
  const currentId = restaurantsStore.lastPickedId
  const pick = restaurantsStore.pickRandom(areaParam.value)
  if (!pick) {
    inlineMessage.value = "That's the only option here!"
    return
  }
  if (pick.id === currentId) {
    inlineMessage.value = "That's the only option here!"
  }
}

onMounted(() => {
  if (!restaurantsStore.lastPickedId) {
    router.replace('/')
  }
})
</script>

<style scoped></style>
