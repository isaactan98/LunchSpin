<template>
  <div class="flex flex-col min-h-full bg-slate-950 text-white">
    <!-- Header -->
    <header class="px-4 pt-8 pb-6 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white tracking-tight">LunchSpin</h1>
      <div
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-sm text-slate-200"
      >
        <span>{{ mealIcon }}</span>
        <span class="capitalize">{{ meal }}</span>
      </div>
    </header>

    <!-- Empty state -->
    <div
      v-if="isEmpty"
      class="flex-1 flex flex-col items-center justify-center px-6 text-center"
    >
      <UIcon
        name="i-heroicons-moon"
        class="w-12 h-12 text-slate-600 mb-4"
      />
      <p class="text-slate-300 font-medium">No places open right now</p>
      <p class="text-slate-500 text-sm mt-2">
        Try switching off Skip Recent in Manage
      </p>
    </div>

    <template v-else>
      <!-- Hero CTA -->
      <div class="px-4">
        <button
          class="w-full py-5 rounded-3xl font-bold text-xl text-white shadow-lg shadow-orange-500/20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 transition-all active:scale-95"
          @click="onSurpriseMe"
        >
          <span class="inline-flex items-center gap-2">
            <span class="text-2xl">🎲</span>
            <span>Surprise Me</span>
          </span>
        </button>
        <p
          v-if="errorMessage"
          class="mt-3 text-center text-sm text-amber-400"
        >
          {{ errorMessage }}
        </p>
      </div>

      <!-- Location grid -->
      <section class="px-4 mt-8 pb-6">
        <h2 class="text-sm font-medium text-slate-400 mb-3">Or pick a place:</h2>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="area in sortedAreas"
            :key="area.name"
            class="flex flex-col items-start gap-1 p-4 rounded-2xl bg-slate-800 border border-slate-700 hover:border-orange-500/60 hover:bg-slate-800/80 transition-all active:scale-95 text-left"
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRestaurantsStore } from '~/stores/restaurants'

const router = useRouter()
const restaurantsStore = useRestaurantsStore()

const errorMessage = ref<string>('')

const meal = computed(() => restaurantsStore.currentMeal())
const mealIcon = computed(() => (meal.value === 'lunch' ? '☀️' : '🌙'))

const isEmpty = computed(() => restaurantsStore.availableNow.length === 0)

interface AreaEntry {
  name: string
  count: number
}

const sortedAreas = computed<AreaEntry[]>(() => {
  const counts = restaurantsStore.areaCounts
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})

function onSurpriseMe(): void {
  errorMessage.value = ''
  const pick = restaurantsStore.pickRandom()
  if (!pick) {
    errorMessage.value = 'Nothing open right now'
    return
  }
  router.push('/result')
}

function onPickArea(area: string): void {
  errorMessage.value = ''
  const pick = restaurantsStore.pickRandom(area)
  if (!pick) {
    errorMessage.value = `Nothing open in ${area} right now`
    return
  }
  router.push({ path: '/result', query: { area } })
}
</script>

<style scoped></style>
