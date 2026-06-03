<template>
  <ClientOnly>
    <Transition name="collapse">
      <div
        v-if="show"
        class="mx-4 mt-3 rounded-2xl bg-slate-800 border border-slate-700 px-4 py-4"
      >
        <div class="flex items-start justify-between gap-2 mb-3">
          <h2 class="text-base font-semibold text-white">Welcome to LunchSpin</h2>
          <button
            class="shrink-0 p-1 -m-1 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Dismiss welcome hints"
            @click="dismiss"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <ul class="space-y-3">
          <li class="flex items-start gap-3">
            <UIcon
              name="i-heroicons-light-bulb"
              class="w-5 h-5 text-orange-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p class="text-sm text-slate-200 leading-relaxed">
              Tap the orange button — we pick a place for you
            </p>
          </li>
          <li class="flex items-start gap-3">
            <UIcon
              name="i-heroicons-map-pin"
              class="w-5 h-5 text-orange-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p class="text-sm text-slate-200 leading-relaxed">
              Or tap area cards to choose from specific malls
            </p>
          </li>
          <li class="flex items-start gap-3">
            <UIcon
              name="i-heroicons-list-bullet"
              class="w-5 h-5 text-orange-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p class="text-sm text-slate-200 leading-relaxed">
              Use My Places to hide places you don't like
            </p>
          </li>
        </ul>
        <button
          class="mt-4 w-full min-h-[48px] bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-2xl transition-all active:scale-95"
          @click="dismiss"
        >
          Got it
        </button>
      </div>
    </Transition>
  </ClientOnly>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'lunchspin:onboarded_v1'
const show = ref(false)

onMounted(() => {
  if (typeof localStorage === 'undefined') return
  if (!localStorage.getItem(STORAGE_KEY)) {
    show.value = true
  }
})

function dismiss(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, '1')
  }
  show.value = false
}
</script>
