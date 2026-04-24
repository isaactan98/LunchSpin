<template>
  <div class="flex flex-col min-h-full">
    <!-- Header -->
    <header class="flex items-center gap-3 px-4 pt-6 pb-2">
      <button
        class="text-slate-400 hover:text-white transition-colors p-1"
        @click="goHome"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
      </button>
      <h2 class="text-lg font-bold text-white">Your pick</h2>
    </header>

    <!-- No winner guard -->
    <div v-if="!winner" class="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <div class="text-4xl">🤔</div>
      <p class="text-slate-400">No result yet. Go back and make a pick!</p>
      <button
        class="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold"
        @click="goHome"
      >
        Start over
      </button>
    </div>

    <!-- Result -->
    <div v-else class="flex-1 px-4 pb-6 overflow-y-auto">
      <ResultCard
        :restaurant="winner"
        @lets-go="handleLetsGo"
        @pick-again="handlePickAgain"
        @not-today="handleNotToday"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { useRestaurantsStore } from '~/stores/restaurants'
import { useVisitHistory } from '~/composables/useVisitHistory'

const router = useRouter()
const sessionStore = useSessionStore()
const restaurantsStore = useRestaurantsStore()
const { markVisited, getRecentlyVisited } = useVisitHistory()

const winner = computed(() => sessionStore.winner)

function goHome() {
  router.push('/')
}

function handleLetsGo() {
  if (winner.value) {
    markVisited(winner.value.id)
  }
  router.push('/')
}

function handlePickAgain() {
  // Rerun with same filters, same pool
  const recentlyVisited = getRecentlyVisited()
  sessionStore.buildPool(restaurantsStore.visible, recentlyVisited)
  sessionStore.startBracket()
  if (sessionStore.winner) {
    // Single item pool, stay on result
    return
  }
  router.push('/decide')
}

function handleNotToday() {
  if (winner.value) {
    sessionStore.excludeToday(winner.value.id)
  }
  // Re-run with same filters, excluding today's choice
  const recentlyVisited = getRecentlyVisited()
  sessionStore.buildPool(restaurantsStore.visible, recentlyVisited)
  sessionStore.startBracket()

  if (sessionStore.pool.length === 0) {
    router.push('/')
    return
  }
  if (sessionStore.winner) {
    // Pool of 1, winner already set, stay on result
    return
  }
  router.push('/decide')
}

// Guard: if landed here without a winner
onMounted(() => {
  if (!winner.value) {
    router.push('/')
  }
})
</script>
