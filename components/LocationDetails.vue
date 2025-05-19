<script setup>
import { computed } from 'vue';

const props = defineProps({
  locationData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['delete']);

const handleDelete = () => {
  emit('delete');
};

const locationCoords = computed(() => {
  if (!props.locationData) return 'No disponible';
  return `Lat: ${props.locationData.latX.toFixed(6)}, Lng: ${props.locationData.lonY.toFixed(6)}`;
});
</script>

<template>
  <div v-if="locationData" class="bg-white p-4 border-b border-gray-200 shadow-sm">
    <div class="flex justify-between items-center mb-2">
      <div class="flex items-center space-x-4">
        <h3 class="text-xl font-bold text-green-700">{{ locationData.name }}</h3>
        <div @click="handleDelete"
          class="flex items-center space-x-1 px-2 py-1 hover:text-white hover:bg-orange-400 transition rounded-lg duration-300 cursor-pointer bg-gray-100 shadow-md text-sm">
          <Icon name="material-symbols:delete" />
          <span class="font-semibold">Borrar ubicación</span>
        </div>
      </div>
      <div class="flex items-center">
        <span class="text-yellow-500 mr-1 tracking-tighter">★★★★★</span>
        <span class="text-sm text-gray-600">{{ locationData.rating }}/5</span>
      </div>
    </div>
    <p class="text-gray-600 mb-2">{{ locationData.description }}</p>
    <div class="text-sm text-gray-500">{{ locationCoords }}</div>
    
  </div>
</template>