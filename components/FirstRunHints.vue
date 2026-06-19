<template>
  <ClientOnly>
    <Transition name="fade">
      <div
        v-if="show"
        class="px-4 mt-3"
        role="status"
        aria-live="polite"
      >
        <div class="relative mx-auto max-w-xs">
          <div
            class="relative inline-flex w-full items-center justify-between gap-2 rounded-2xl bg-orange-500 text-white px-4 py-3 shadow-lg shadow-orange-500/30"
          >
            <span class="inline-flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden="true">👇</span>
              <span>Tap me. I'll pick lunch.</span>
            </span>
            <button
              type="button"
              class="shrink-0 p-1 -m-1 text-white/90 hover:text-white transition-colors"
              aria-label="Dismiss hint"
              @click="dismiss"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" aria-hidden="true" />
            </button>
            <!-- Speech-bubble tail pointing down at the Spin button below -->
            <span
              aria-hidden="true"
              class="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 rotate-45 bg-orange-500"
            />
          </div>
        </div>
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
