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
  restaurantsStore.loadFilters()
  // Persist any filter-state change to localStorage
  restaurantsStore.$subscribe((_mutation, state) => {
    if (!import.meta.client) return
    try {
      const payload = {
        priceFilters: state.priceFilters,
        cuisineFilters: state.cuisineFilters,
        serviceFilters: state.serviceFilters,
        withFilters: state.withFilters,
        orderingFilters: state.orderingFilters,
        payFilters: state.payFilters,
      }
      localStorage.setItem('lunchspin:filters', JSON.stringify(payload))
    } catch {
      // Ignore quota/serialization errors
    }
  })
  await restaurantsStore.load()
})
</script>
