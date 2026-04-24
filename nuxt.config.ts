export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@vite-pwa/nuxt'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'LunchSpin',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Decide what to eat for lunch or dinner in Singapore' },
        { name: 'theme-color', content: '#f97316' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'LunchSpin' },
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/icons/icon-192.png' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'LunchSpin',
      short_name: 'LunchSpin',
      description: 'Decide what to eat for lunch or dinner in Singapore',
      theme_color: '#f97316',
      background_color: '#0f172a',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff,woff2}'],
      runtimeCaching: [
        {
          urlPattern: '/data/restaurants.json',
          handler: 'CacheFirst',
          options: {
            cacheName: 'restaurant-data',
            expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 7 },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },

  compatibilityDate: '2024-11-01',
})
