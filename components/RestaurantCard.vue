<template>
  <div class="rounded-2xl bg-slate-800 border border-slate-700 p-4 space-y-3">
    <!-- Name + area + price -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <h2 class="text-xl font-bold text-white leading-tight">{{ restaurant.name }}</h2>
        <p class="text-slate-400 text-sm mt-0.5">{{ restaurant.area }}</p>
      </div>
      <span class="text-lg font-bold text-orange-400 shrink-0">{{ '$'.repeat(restaurant.price_range) }}</span>
    </div>

    <!-- Cuisine chips -->
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="c in restaurant.cuisine"
        :key="c"
        class="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30"
      >
        {{ c }}
      </span>
    </div>

    <!-- Open days -->
    <div class="flex gap-1">
      <span
        v-for="day in allDays"
        :key="day"
        class="text-[10px] w-7 h-7 rounded-full flex items-center justify-center font-medium"
        :class="
          restaurant.open_days.includes(day)
            ? 'bg-slate-600 text-white'
            : 'bg-slate-800/50 text-slate-600'
        "
      >
        {{ day.charAt(0) }}
      </span>
    </div>

    <!-- Meal type badges -->
    <div class="flex gap-2">
      <span
        v-if="restaurant.meal.includes('lunch')"
        class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30"
      >
        ☀️ Lunch
      </span>
      <span
        v-if="restaurant.meal.includes('dinner')"
        class="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
      >
        🌙 Dinner
      </span>
    </div>

    <!-- Tags -->
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="tag in restaurant.tags"
        :key="tag"
        class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-700 text-slate-400"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Notes -->
    <p v-if="restaurant.notes" class="text-sm text-slate-400 leading-relaxed border-t border-slate-700 pt-3">
      {{ restaurant.notes }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Restaurant } from '~/stores/restaurants'

defineProps<{ restaurant: Restaurant }>()

const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
</script>
