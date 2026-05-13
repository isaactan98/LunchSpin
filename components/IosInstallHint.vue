<template>
  <ClientOnly>
    <div
      v-if="show"
      class="mx-4 mt-3 flex items-start gap-2.5 rounded-2xl bg-slate-800 border border-slate-700 px-3.5 py-2.5"
    >
      <UIcon
        name="i-heroicons-arrow-up-on-square"
        class="w-5 h-5 text-orange-400 shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <p class="flex-1 text-xs text-slate-300 leading-relaxed">
        Install LunchSpin: tap Share → Add to Home Screen
      </p>
      <button
        class="shrink-0 p-1 -m-1 text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="Dismiss install hint"
        @click="dismiss"
      >
        <UIcon name="i-heroicons-x-mark" class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const show = ref(false)

const STORAGE_KEY = 'lunchspin:ios_hint_dismissed'

onMounted(() => {
  if (typeof navigator === 'undefined') return
  const isIos = /iPhone|iPad/.test(navigator.userAgent)
  // navigator.standalone exists on iOS Safari but isn't in the standard types
  const isStandalone = Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  const dismissed = localStorage.getItem(STORAGE_KEY) === '1'
  if (isIos && !isStandalone && !dismissed) {
    show.value = true
  }
})

function dismiss(): void {
  localStorage.setItem(STORAGE_KEY, '1')
  show.value = false
}
</script>
