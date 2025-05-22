<script setup>
import { ref } from 'vue';

const emit = defineEmits(['zoom-in', 'zoom-out', 'add-point']);

const handleZoomIn = () => {
  emit('zoom-in');
};

const handleZoomOut = () => {
  emit('zoom-out');
};

const handleAddPoint = () => {
  emit('add-point');
};
</script>

<template>
  <div class="map-controls flex flex-col gap-1">
    <button
      class="w-8 h-8 bg-white rounded flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer text-blue-700 font-bold transition-colors"
      @click="handleZoomIn" title="Acercar">
      +
    </button>
    <button
      class="w-8 h-8 bg-white rounded flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer text-blue-700 font-bold transition-colors"
      @click="handleZoomOut" title="Alejar">
      -
    </button>
    <button @click="handleAddPoint"
      class="w-8 h-8 bg-white rounded flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer text-blue-700 font-bold transition-colors"
      title="Añadir nuevo punto">
      <Icon name="material-symbols:add-location-alt" />
    </button>
  </div>
</template>