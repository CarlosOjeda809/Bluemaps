<script setup>
import LeafletMap from '~/pages/leafletmap.vue'

const pageLoaded = ref(false)
pageLoaded.value = true

</script>

<template>
  <div class="flex flex-col h-screen bg-blue-50 font-sans">
    <main class="flex-1 relative overflow-hidden">
      <div v-if="!pageLoaded" class="absolute inset-0 bg-white/90 flex flex-col justify-center items-center z-10">
        <div class="w-10 h-10 border-4 border-blue-800/30 border-t-blue-800 rounded-full animate-spin mb-4"></div>
        <p>Cargando mapa...</p>
      </div>

      <ClientOnly>
        <Transition enter-active-class="transition-opacity duration-500"
          leave-active-class="transition-opacity duration-500" enter-from-class="opacity-0" leave-to-class="opacity-0">
          <LeafletMap v-if="pageLoaded" class="h-full w-full" />
        </Transition>
      </ClientOnly>
    </main>
  </div>
</template>
