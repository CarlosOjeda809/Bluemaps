<script setup>
import LeafletMap from '@/components/leafletmap.vue'

const pageLoaded = ref(false)
pageLoaded.value = true

</script>

<template>
  <div class="flex flex-col h-screen bg-green-50 font-sans">
    <header
      class="bg-gradient-to-r from-green-700 to-green-400 text-white px-5 h-16 flex items-center justify-between shadow-md"
    >
      <div class="flex items-center font-bold text-2xl">
        <span class="mr-2 text-3xl">🍃</span>
        <span class="hidden sm:inline">GreenMaps</span>
      </div>
      <div class="flex gap-2.5">
        <button
          class="w-9 h-9 rounded-full bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-white/30"
        >
          🔍
        </button>
        <button
          class="w-9 h-9 rounded-full bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-white/30"
        >
          👤
        </button>
      </div>
    </header>

    <main class="flex-1 relative overflow-hidden">
      <div
        v-if="!pageLoaded"
        class="absolute inset-0 bg-white/90 flex flex-col justify-center items-center z-10"
      >
        <div
          class="w-10 h-10 border-4 border-green-800/30 border-t-green-800 rounded-full animate-spin mb-4"
        ></div>
        <p>Cargando mapa...</p>
      </div>

      <ClientOnly>
        <Transition
          enter-active-class="transition-opacity duration-500"
          leave-active-class="transition-opacity duration-500"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <LeafletMap v-if="pageLoaded" class="h-full w-full" />
        </Transition>
      </ClientOnly>
    </main>
    
  </div>
</template>

