<template>
  <div class="flex flex-col min-h-full">
    <!-- Header -->
    <header class="flex items-center gap-3 px-4 pt-6 pb-4">
      <button
        class="text-slate-400 hover:text-white transition-colors p-1"
        @click="goBack"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
      </button>
      <div class="flex-1">
        <h2 class="text-lg font-bold text-white">Which one?</h2>
        <p class="text-xs text-slate-400">{{ remainingCount }} remaining</p>
      </div>
      <!-- Progress dots -->
      <div class="flex gap-1">
        <div
          v-for="i in totalMatchups"
          :key="i"
          class="h-1.5 rounded-full transition-all"
          :class="
            i <= completedMatchups
              ? 'bg-orange-500 w-4'
              : 'bg-slate-700 w-1.5'
          "
        />
      </div>
    </header>

    <!-- Empty state -->
    <div v-if="poolIsEmpty" class="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <div class="text-5xl">🤷</div>
      <h3 class="text-xl font-bold text-white">No matches found</h3>
      <p class="text-slate-400 text-sm">Try relaxing your filters to see more options.</p>
      <button
        class="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-400 transition-colors"
        @click="goBack"
      >
        Adjust filters
      </button>
    </div>

    <!-- Matchup -->
    <div v-else-if="currentMatchup" class="flex-1 flex flex-col justify-center">
      <BracketMatch
        :matchup="currentMatchup"
        @pick="handlePick"
      />
    </div>

    <!-- Redirecting to result -->
    <div v-else-if="winner" class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-3">
        <div class="text-4xl">🎉</div>
        <p class="text-slate-300">We have a winner!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import type { Restaurant } from '~/stores/restaurants'

const router = useRouter()
const sessionStore = useSessionStore()

const currentMatchup = computed(() => sessionStore.currentMatchup)
const winner = computed(() => sessionStore.winner)
const poolIsEmpty = computed(() => sessionStore.pool.length === 0)

const remainingCount = computed(() => {
  const round = sessionStore.bracket[sessionStore.round]
  return round ? round.length : 0
})

const totalMatchups = computed(() => {
  if (sessionStore.pool.length <= 1) return 1
  return Math.ceil(Math.log2(sessionStore.pool.length))
})

const completedMatchups = ref(0)

function handlePick(picked: Restaurant) {
  completedMatchups.value++
  sessionStore.pick(picked)
  if (sessionStore.winner) {
    setTimeout(() => router.push('/result'), 300)
  }
}

function goBack() {
  router.push('/')
}

// Handle single-item pool or direct winner
onMounted(() => {
  if (!sessionStore.pool.length && !winner.value) {
    // Came here without starting a session
    router.push('/')
    return
  }
  if (winner.value) {
    router.push('/result')
  }
})

// Watch for winner from single-item pool
watch(winner, (val) => {
  if (val) {
    setTimeout(() => router.push('/result'), 300)
  }
})
</script>
