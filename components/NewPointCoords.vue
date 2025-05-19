<script setup>
import { ref, computed, watch } from 'vue';
import { useSupabaseClient } from '#imports';

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    coords: {
        type: Array,
        default: () => null
    }
});

const emit = defineEmits(['close', 'add']);

const client = useSupabaseClient();
const name = ref('');
const description = ref('');
const imageUrl = ref('');
const rating = ref(5);
const isLoading = ref(false);
const error = ref('');

const formattedCoords = computed(() => {
    if (!props.coords) return 'No disponible';
    return `Lat: ${props.coords[0]?.toFixed(6)}, Lng: ${props.coords[1]?.toFixed(6)}`;
});

watch(() => props.isOpen, (newValue) => {
    if (newValue) {
        
        error.value = '';
    } else {
        resetValues();
    }
});

const resetValues = () => {
    name.value = '';
    description.value = '';
    imageUrl.value = '';
    rating.value = 5;
    error.value = '';
};

const closeModal = () => {
    emit('close');
};

const addLocation = async () => {
    error.value = '';

    if (!name.value.trim()) {
        error.value = 'El nombre es obligatorio';
        return;
    }

    if (!description.value.trim()) {
        error.value = 'La descripción es obligatoria';
        return;
    }

    if (!props.coords || props.coords.length !== 2) {
        error.value = 'Coordenadas inválidas';
        return;
    }

    try {
        isLoading.value = true;

        const { data, error: dbError } = await client
            .from('locations')
            .insert({
                name: name.value,
                latX: props.coords[0],
                lonY: props.coords[1],
                description: description.value,
                image: imageUrl.value || 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png',
                rating: rating.value
            })
            .select();

        if (dbError) {
            console.error('Error de Supabase:', dbError);
            throw dbError;
        }

        if (data && data.length > 0) {
            emit('add', data[0]);
            closeModal();
        }
    } catch (err) {
        console.error('Error al crear la ubicación:', err);
        error.value = 'Error al crear la ubicación. Inténtalo de nuevo.';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-[2000]">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button @click="closeModal" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl">
                <Icon name="material-symbols:close" />
            </button>

            <h2 class="text-xl font-bold text-green-700 mb-4">Agregar nuevo punto de interés</h2>

            <div class="mb-3">
                <p class="text-sm text-gray-600 mb-1">Ubicación seleccionada:</p>
                <p class="font-medium">{{ formattedCoords }}</p>
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
                    Nombre del lugar
                </label>
                <input id="name" v-model="name" type="text"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Nombre del lugar" />
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="description">
                    Descripción
                </label>
                <textarea id="description" v-model="description"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                    placeholder="Describe este lugar..."></textarea>
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="image">
                    URL de la imagen
                </label>
                <input id="image" v-model="imageUrl" type="text"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="https://ejemplo.com/imagen.jpg" />
            </div>

            <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="rating">
                    Valoración ({{ rating }}/5)
                </label>
                <input id="rating" v-model="rating" type="range" min="1" max="5" step="0.1"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {{ error }}
            </div>

            <div class="flex justify-end gap-2">
                <button @click="closeModal"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    Cancelar
                </button>
                <button @click="addLocation" :disabled="isLoading"
                    class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                    <span v-if="isLoading">Guardando...</span>
                    <span v-else>Guardar ubicación</span>
                </button>
            </div>
        </div>
    </div>
</template>
