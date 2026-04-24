<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const restaurantsStore = useRestaurantsStore()

onMounted(async () => {
  restaurantsStore.loadActiveOverrides()
  await restaurantsStore.load()
})
</script>
