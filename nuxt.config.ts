// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_KEY || '',
      mapsKey: process.env.MAPS_KEY || '',

    }},
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    modules: ['@nuxt/icon', '@nuxt/ui', '@nuxtjs/supabase'],
    css: ['./assets/css/main.css', 'leaflet/dist/leaflet.css'],
    supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: ['*'], 
      saveRedirectToCookie: false
    }
  },
  
})