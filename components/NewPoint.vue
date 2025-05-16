<script setup>
const client = useSupabaseClient();

    const props = defineProps({
        isOpen: { type: Boolean, required: true },
        coords: { required: true }
    }); 

    

const activeLocationData = computed(() => {
    return locations.value[activeLocation.value];
});

    const emit = defineEmits(['close', 'add'])

    const newPointCoords = ref([null, null]);
    const newPointName = ref('');
    const newPointImage = ref('');
    const newPointDescription = ref('');

    watch(() => props.isOpen, (isOpen) => {
        if (isOpen) {
            if (props.coords) { newPointCoords.value = props.coords }
            else { newPointCoords.value = [40.416775, -3.7903790]; }
            
            newPointName.value = '';
            newPointDescription.value = '';
            newPointImage.value = '';
        }
    })

    const saveNewPoint = async () => {
        if (!newPointCoords.value[0] || !newPointCoords.value[1] || !newPointDescription.value || !newPointName.value) { return; }
        
        let newPoint = {
            name: newPointName.value,
            description: newPointDescription.value,
            latX: newPointCoords.value[0],
            lonY: newPointCoords.value[1],
            image: newPointImage.value || 'https://seftic.com/wp-content/themes/consultix/images/no-image-found-360x250.png',
            rating: 4.0,
        }

        const { data, error } = await client
            .from('locations')
            .insert(newPoint)
            .select('id').single()
        if (error) { console.error(error); return; }

        newPoint.id = data.id;
        newPoint.category = null;
        
        emit('add', newPoint)
        close();
    };

    const close = () => { emit('close') }
</script>

<template>
    <span v-if="isOpen" @click="close()" class="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-1000">
            <main @click.prevent.stop class="bg-white p-6 rounded-md shadow-lg z-1000 w-96 relative">
                <h3 class="text-lg font-bold mb-3 text-green-700">Nuevo Punto</h3>
                <section class="mb-3">
                    <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
                    <input type="text" id="name" v-model="newPointName" placeholder="Nombre del lugar" class="shadow border-1 hover:border-green-600 border-gray-200 transition duration-500 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </section>
                <section class="mb-4">
                    <label for="description" class="block text-gray-700 text-sm font-bold mb-2">Descripción:</label>
                    <textarea id="description" v-model="newPointDescription" placeholder="Descripción del lugar" class="shadow appearance-none border-1 hover:border-green-600 transition duration-500 border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                </section>
                <section class="mb-4">
                    <label for="image" class="block text-gray-700 text-sm font-bold mb-2">Imagen:</label>
                    <input id="image" v-model="newPointImage" placeholder="Url de la imagen" class="shadow appearance-none border-1 hover:border-green-600 transition duration-500 border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </section>
                <ul class="mb-4 grid grid-cols-2 gap-4">
                    <li>
                        <label for="latX" class="block text-gray-700 text-sm font-bold mb-2">Latitud:</label>
                        <input type="number" id="latX" step="0.000001" v-model="newPointCoords[0]"  class="shadow appearance-none border-1 hover:border-green-600 transition duration-500 border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </li>
                    <li>
                        <label for="lonY" class="block text-gray-700 text-sm font-bold mb-2">Longitud:</label>
                        <input type="number" id="lonY" step="0.000001" v-model="newPointCoords[1]" class="shadow appearance-none border-1 hover:border-green-600 transition duration-500 border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </li>
                </ul>
                <section class="mb-4">
                    <p class="text-sm text-gray-700">
                        Las coordenadas introducidas se mostrarán en el mapa una vez guardado el punto.
                    </p>
                </section>
                <section class="flex justify-end gap-2">
                    <button @click="close()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Cancelar
                    </button>
                    <button @click="saveNewPoint" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer focus:outline-none focus:shadow-outline" :disabled="!newPointCoords || !newPointName || !newPointDescription">
                        Guardar
                    </button>
                </section>
            </main>
        </span>
</template>
