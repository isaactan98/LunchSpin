<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- Round indicator -->
    <div class="text-center">
      <p class="text-xs text-slate-500 uppercase tracking-wider">Pick your preference</p>
    </div>

    <!-- Card A -->
    <button
      :key="matchup[0].id"
      class="w-full text-left rounded-2xl border transition-all active:scale-[0.97] p-4"
      :class="
        chosen === matchup[0].id
          ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-900/30'
          : 'bg-slate-800 border-slate-700 hover:border-orange-400/50'
      "
      @click="pick(matchup[0])"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-base text-white leading-tight">{{ matchup[0].name }}</h3>
          <p class="text-sm mt-0.5" :class="chosen === matchup[0].id ? 'text-orange-100' : 'text-slate-400'">
            {{ matchup[0].area }} · {{ matchup[0].cuisine.slice(0, 2).join(', ') }}
          </p>
        </div>
        <div class="shrink-0 flex flex-col items-end gap-1.5">
          <span class="text-sm font-bold" :class="chosen === matchup[0].id ? 'text-orange-100' : 'text-slate-300'">
            {{ '$'.repeat(matchup[0].price_range) }}
          </span>
          <div class="flex gap-1">
            <span
              v-for="tag in matchup[0].tags.slice(0, 2)"
              :key="tag"
              class="text-[10px] px-1.5 py-0.5 rounded-full"
              :class="chosen === matchup[0].id ? 'bg-orange-400/30 text-orange-100' : 'bg-slate-700 text-slate-400'"
            >{{ tag }}</span>
          </div>
        </div>
      </div>
      <p
        v-if="matchup[0].notes"
        class="text-xs mt-3 leading-relaxed line-clamp-2"
        :class="chosen === matchup[0].id ? 'text-orange-100/80' : 'text-slate-500'"
      >{{ matchup[0].notes }}</p>
    </button>

    <!-- VS divider -->
    <div class="flex items-center gap-3">
      <div class="flex-1 h-px bg-slate-800" />
      <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">vs</span>
      <div class="flex-1 h-px bg-slate-800" />
    </div>

    <!-- Card B -->
    <button
      :key="matchup[1].id"
      class="w-full text-left rounded-2xl border transition-all active:scale-[0.97] p-4"
      :class="
        chosen === matchup[1].id
          ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-900/30'
          : 'bg-slate-800 border-slate-700 hover:border-orange-400/50'
      "
      @click="pick(matchup[1])"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-base text-white leading-tight">{{ matchup[1].name }}</h3>
          <p class="text-sm mt-0.5" :class="chosen === matchup[1].id ? 'text-orange-100' : 'text-slate-400'">
            {{ matchup[1].area }} · {{ matchup[1].cuisine.slice(0, 2).join(', ') }}
          </p>
        </div>
        <div class="shrink-0 flex flex-col items-end gap-1.5">
          <span class="text-sm font-bold" :class="chosen === matchup[1].id ? 'text-orange-100' : 'text-slate-300'">
            {{ '$'.repeat(matchup[1].price_range) }}
          </span>
          <div class="flex gap-1">
            <span
              v-for="tag in matchup[1].tags.slice(0, 2)"
              :key="tag"
              class="text-[10px] px-1.5 py-0.5 rounded-full"
              :class="chosen === matchup[1].id ? 'bg-orange-400/30 text-orange-100' : 'bg-slate-700 text-slate-400'"
            >{{ tag }}</span>
          </div>
        </div>
      </div>
      <p
        v-if="matchup[1].notes"
        class="text-xs mt-3 leading-relaxed line-clamp-2"
        :class="chosen === matchup[1].id ? 'text-orange-100/80' : 'text-slate-500'"
      >{{ matchup[1].notes }}</p>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Restaurant } from '~/stores/restaurants'

const props = defineProps<{
  matchup: [Restaurant, Restaurant]
}>()

const emit = defineEmits<{
  pick: [winner: Restaurant]
}>()

const chosen = ref<string | null>(null)

function pick(restaurant: Restaurant) {
  chosen.value = restaurant.id
  setTimeout(() => {
    emit('pick', restaurant)
    chosen.value = null
  }, 250)
}
</script>
