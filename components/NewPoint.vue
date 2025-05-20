<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

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

const latitude = ref('');
const longitude = ref('');
const name = ref('');
const description = ref('');
const imageUrl = ref('');
const rating = ref(3.0);
const error = ref('');
const isLoading = ref(false);
const modalRef = ref(null);
const client = useSupabaseClient();

const closeModal = () => {

    latitude.value = '';
    longitude.value = '';
    name.value = '';
    description.value = '';
    imageUrl.value = '';
    rating.value = 3.0;
    error.value = '';
    emit('close');
};

const handleClose = () => {
    closeModal();
};

const resetValues = () => {
    name.value = '';
    description.value = '';
    imageUrl.value = '';
    rating.value = 5;
    error.value = '';
};


const handleClickOutside = (event) => {
    if (modalRef.value && !modalRef.value.contains(event.target)) {
        closeModal();
    }
};

const addLocation = async () => {
    error.value = '';

    if (!name.value.trim()) {
        error.value = 'El nombre es obligatorio.';
        return;
    }

    if (!description.value.trim()) {
        error.value = 'La descripción es obligatoria.';
        return;
    }

    const lat = parseFloat(latitude.value);
    const lng = parseFloat(longitude.value);

    if (isNaN(lat) || isNaN(lng)) {
        error.value = 'Por favor, introduce latitud y longitud válidas.';
        return;
    }

    isLoading.value = true;
    try {
        const { data, error: dbError } = await client
            .from('locations')
            .insert({
                name: name.value,
                latX: lat,
                lonY: lng,
                description: description.value,
                image: imageUrl.value || 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png',
                rating: rating.value,
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

const formattedCoords = computed(() => {
    if (!props.coords) return 'No disponible';
    return `Lat: ${props.coords[0]?.toFixed(6)}, Lng: ${props.coords[1]?.toFixed(6)}`;
});

watch(() => props.isOpen, (newValue) => {
    if (newValue) {

        if (!latitude.value && props.coords?.[0]) {
            latitude.value = props.coords[0].toFixed(6);
        }
        if (!longitude.value && props.coords?.[1]) {
            longitude.value = props.coords[1].toFixed(6);
        }
        error.value = '';
    } else {
        resetValues();
    }
});

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
    <div v-if="props.isOpen" class="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-[2100]">
        <div ref="modalRef" class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative">
            <button @click="handleClose" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl">
                <Icon name="material-symbols:close" />
            </button>
            <h2 class="text-xl font-bold text-green-700 mb-4">Crear ubicación manualmente</h2>
            <div class="mb-3">
                <label for="latitude" class="block text-gray-700 text-sm font-bold mb-2">Latitud:</label>
                <input type="number" id="latitude" v-model="latitude"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Ej: 39.46667">
            </div>
            <div class="mb-3">
                <label for="longitude" class="block text-gray-700 text-sm font-bold mb-2">Longitud:</label>
                <input type="number" id="longitude" v-model="longitude"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Ej: -0.375">
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
                <button @click="handleClose"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    Cancelar
                </button>
                <button @click="addLocation" :disabled="isLoading"
                    class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <span v-if="isLoading">Guardando...</span>
                    <span v-else>Guardar ubicación</span>
                </button>
            </div>
        </div>
    </div>
</template>