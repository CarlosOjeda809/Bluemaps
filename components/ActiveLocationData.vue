<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  activeLocationData: Object
});
const emit = defineEmits(['delete']);

function deleteLocation() {
  emit('delete');
}
</script>

<template>
    <div class="flex justify-between items-center mb-2">
        <div class="flex items-center space-x-2">
            <h3 class="text-xl font-bold text-green-700">{{ activeLocationData.name }}</h3>
            <div @click="deleteLocation"
                class="flex items-center hover:text-white hover:bg-orange-400 transition rounded-lg duration-500 cursor-pointer bg-gray-100 p-1 shadow-md text-md">
                <Icon name="material-symbols:delete"></Icon>
                <p class="font-semibold">Borrar ubicación activa</p>
            </div>
        </div>
        <div class="flex items-center">
            <span class="text-yellow-500 mr-1 tracking-tighter">★★★★★</span>
            <span class="text-sm text-gray-600">{{ activeLocationData.rating }}/5</span>
        </div>
    </div>
    <p class="text-gray-600 mb-3">{{ activeLocationData.description }}</p>
    <div class="flex gap-3">
        <button
            class="bg-green-700 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-green-800 transition-colors">
            Ver detalles
        </button>
        <button
            class="border border-green-700 text-green-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-green-50 transition-colors">
            Cómo llegar
        </button>
    </div>


    <div class="flex-1 relative">
        <div class="absolute top-5 left-5 z-1000 bg-white rounded-md shadow-md p-2">
            <input type="text" v-model="searchInput" placeholder="Buscar lugares..."
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                @keyup.enter="searchPlaces" />
            <button @click="searchPlaces"
                class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2">
                Buscar
            </button>
        </div>
    </div>

</template>

<style scoped></style>
