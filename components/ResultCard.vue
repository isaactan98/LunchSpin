<template>
  <div class="space-y-4">
    <!-- Winner announcement -->
    <div class="text-center py-2">
      <span class="text-3xl">🎯</span>
      <p class="text-xs uppercase tracking-widest text-orange-400 font-semibold mt-2">{{ mealLabel }} we're going to</p>
    </div>

    <RestaurantCard :restaurant="restaurant" />

    <!-- Actions -->
    <div class="flex flex-col gap-3 pt-2">
      <button
        class="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-base transition-all"
        @click="emit('lets-go')"
      >
        Let's Go! 🚀
      </button>
      <div class="flex gap-3">
        <button
          class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
          @click="emit('pick-again')"
        >
          Pick again
        </button>
        <button
          class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
          @click="emit('not-today')"
        >
          Not today
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Restaurant } from '~/stores/restaurants'
import { useSessionStore } from '~/stores/session'

defineProps<{ restaurant: Restaurant }>()

const sessionStore = useSessionStore()
const mealLabel = computed(() => sessionStore.filters.meal === 'lunch' ? 'For lunch' : 'Tonight')

const emit = defineEmits<{
  'lets-go': []
  'pick-again': []
  'not-today': []
}>()
</script>
