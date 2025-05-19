<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['close', 'submit-manual']);

const latitude = ref('');
const longitude = ref('');
const error = ref('');
const modalRef = ref(null);

const handleAdd = () => {
    error.value = '';
    const lat = parseFloat(latitude.value);
    const lng = parseFloat(longitude.value);

    if (isNaN(lat) || isNaN(lng)) {
        error.value = 'Por favor, introduce latitud y longitud válidas.';
        return;
    }

    emit('submit-manual', [lat, lng]);
    closeModal(); // Cerramos el modal tras enviar los datos
};

const handleClose = () => {
    emit('close');
};

const handleClickOutside = (event) => {
    if (modalRef.value && !modalRef.value.contains(event.target)) {
        handleClose();
    }
};

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
    <div v-if="$emit('update:isOpen', false)" class="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-[2100]">
        <div ref="modalRef" class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative">
            <button @click="handleClose" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl">
                <Icon name="material-symbols:close" />
            </button>
            <h2 class="text-xl font-bold text-green-700 mb-4">Crear ubicación manualmente</h2>
            <div class="mb-3">
                <label for="latitude" class="block text-gray-700 text-sm font-bold mb-2">Latitud:</label>
                <input type="number" id="latitude" v-model="latitude" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Ej: 39.46667">
            </div>
            <div class="mb-3">
                <label for="longitude" class="block text-gray-700 text-sm font-bold mb-2">Longitud:</label>
                <input type="number" id="longitude" v-model="longitude" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Ej: -0.375">
            </div>
            <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {{ error }}
            </div>
            <div class="flex justify-end gap-2">
                <button @click="handleClose" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    Cancelar
                </button>
                <button @click="handleAdd" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Siguiente
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Estilos específicos para este componente si es necesario */
</style>