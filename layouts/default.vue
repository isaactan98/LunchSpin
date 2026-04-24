<template>
  <div class="min-h-screen bg-slate-950 text-white flex flex-col">
    <!-- Offline banner -->
    <div
      v-if="!isOnline"
      class="bg-amber-500 text-amber-950 text-center text-sm font-medium py-2 px-4"
    >
      You're offline — using cached data
    </div>

    <!-- Main content -->
    <main class="flex-1 flex flex-col max-w-[430px] mx-auto w-full">
      <slot />
    </main>

    <!-- Bottom nav -->
    <nav class="sticky bottom-0 bg-slate-900 border-t border-slate-800 max-w-[430px] mx-auto w-full">
      <div class="flex">
        <NuxtLink
          to="/"
          class="flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors"
          :class="route.path === '/' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'"
        >
          <UIcon name="i-heroicons-home" class="w-5 h-5" />
          <span>Home</span>
        </NuxtLink>
        <NuxtLink
          to="/manage"
          class="flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors"
          :class="route.path === '/manage' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'"
        >
          <UIcon name="i-heroicons-list-bullet" class="w-5 h-5" />
          <span>Manage</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const isOnline = ref(true)

onMounted(() => {
  isOnline.value = navigator.onLine
  window.addEventListener('online', () => { isOnline.value = true })
  window.addEventListener('offline', () => { isOnline.value = false })
})
</script>
