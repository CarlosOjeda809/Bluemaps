<script setup>
import { ref, onMounted, computed } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const client = useSupabaseClient()
const user = useSupabaseUser()

const center = ref([40.416775, -3.703790])
const zoom = ref(13)
const activeLocation = ref(0)
const showSidebar = ref(true)
const isCreatingNew = ref(false)
const newPointCoords = ref(null)
const newPointName = ref('')
const newPointImage = ref('')
const newPointDescription = ref('')
const locations = ref([])

const mapOptions = {
    zoomControl: false,
    attributionControl: true,
}

const greenIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})


const getLocations = async () => {
    const { data: dataLocation, error: errorLocation } = await client
        .from('locations')
        .select('*')
        
        
    if (errorLocation) {
        console.error('Error al obtener ubicaciones:', errorLocation);
        return;
    }
    
    locations.value = dataLocation || [];
    
    // Mapear propiedades para hacerlas consistentes con el template
    locations.value = locations.value.map(loc => ({
        ...loc,
        descripcion: loc.description || loc.descripcion || '',
        imagen: loc.image || loc.imagen || '/api/placeholder/400/200',
        
    }));
    
    if (locations.value.length > 0) {
        selectLocation(0);
    }
}

const selectLocation = (index) => {
    activeLocation.value = index;
    
    center.value = [locations.value[index].latX, locations.value[index].lonY];
    zoom.value = 15;
}

const weatherInfo = ref({
    temp: '22°C',
    condition: 'Soleado',
    humidity: '45%',
    wind: '12 km/h'
})

const activeLocationData = computed(() => {
    return locations.value[activeLocation.value];
})

const startNewPointCreation = () => {
    isCreatingNew.value = true;
    newPointCoords.value = [40.416775, -3.703790];
    newPointName.value = '';
    newPointImage.value = '';
    newPointDescription.value = '';
}

const deleteLocation = async() => {
    const locationToDelete = locations.value[activeLocation.value];
    
    if (locationToDelete) {
        const { error } = await client
            .from('locations')
            .delete()
            .eq('id', locationToDelete.id);
            
        if (error) {
            console.error('Error al eliminar la ubicación:', error);
            alert('Error al eliminar la ubicación. Inténtalo de nuevo.');
            return;
        }
        
        await getLocations();
        
        if (locations.value.length > 0) {
            selectLocation(0);
        } else {
            activeLocation.value = null;
        }
    }
}

const cancelNewPoint = () => {
    isCreatingNew.value = false;
    newPointCoords.value = [40.416775, -3.703790]; 
}   

const updateCoords = (index, value) => {
    if (!newPointCoords.value) {
        newPointCoords.value = [40.416775, -3.703790]; 
    }
    
    try {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            newPointCoords.value[index] = numValue;
        }
    } catch (e) {
        console.error('Error al convertir coordenada:', e);
    }
}

const saveNewPoint = async () => {
    
    if (newPointCoords.value && newPointName.value && newPointDescription.value && newPointImage.value) {
        
        const newLocation = {
            name: newPointName.value,
            description: newPointDescription.value,
            latX: newPointCoords.value[0],
            lonY: newPointCoords.value[1], 
            image: newPointImage.value || '/api/placeholder/400/200',
            rating: 4.0,
           
        };
        
        const { data, error } = await client
            .from('locations')
            .insert(newLocation);
            
        if (error) {
            console.error('Error al guardar la ubicación:', error);
            alert('Error al guardar la ubicación. Inténtalo de nuevo.');
            return;
        }
        
        await getLocations();
        
        isCreatingNew.value = false;
        newPointCoords.value = [40.416775, -3.703790]; 
        newPointName.value = '';
        newPointDescription.value = '';
        newPointImage.value = '';
        
        if (locations.value.length > 0) {
            selectLocation(0);
        }
    } else {
        alert('Por favor, introduce todos los campos requeridos: nombre, descripción y coordenadas.');
    }
}

const handleContextMenu = (event) => {
    newPointCoords.value = [event.latlng.lat, event.latlng.lng];
    isCreatingNew.value = true;
    newPointName.value = '';
    newPointImage.value = '';
    newPointDescription.value = '';
};

onMounted(async () => {
    document.head.appendChild(document.createElement('link')).href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css';
    
    await getLocations();
})
</script>



<template>
    <div class="flex bg-gray-50 h-screen">
        <div class="bg-gradient-to-b from-green-500 to-green-800 text-white shadow-lg z-10 transition-all duration-300">
            <div v-if="showSidebar" class="p-5 h-full overflow-y-auto">
                <h2 class="text-2xl font-bold m-5  text-center pb-2 border-b border-white/20">Explora España</h2>

                <div class="bg-white/10 rounded-lg p-4 mb-5">
                    <h3 class="text-lg font-medium mb-2">Clima actual</h3>
                    <div class="flex items-center">
                        <div class="text-3xl font-bold mr-5">{{ weatherInfo.temp }}</div>
                        <div class="text-sm">
                            <div>{{ weatherInfo.condition }}</div>
                            <div>Humedad: {{ weatherInfo.humidity }}</div>
                            <div>Viento: {{ weatherInfo.wind }}</div>
                        </div>
                    </div>
                </div>

                <div class="py-5 mb-10">
                    <h3 class="text-lg font-medium mb-3">Lugares destacados</h3>
                    <div v-for="(location, index) in locations" :key="location.id" :class="[
                        'bg-white/10 rounded-lg p-4 mb-4 cursor-pointer transition-all hover:bg-white/20 hover:-translate-y-1',
                        { 'border-l-4 border-green-300 bg-white/20': activeLocation === index },
                    ]" @click="selectLocation(index)">
                        <div class="relative mb-3">
                            <img :src="location.imagen" :alt="location.name"
                                class="w-full h-32 object-cover rounded-md" />
                                
                            
                        </div>
                        <div>
                            <div class="flex items-center justify-between ">
                            <h4 class="font-bold text-base mb-1">{{ location.name }}</h4>
                            <Icon @click="deleteLocation" name="material-symbols:delete" class="hover:text-red-500 transition duration-500"/>
                            </div>
                            <div class="flex items-center mb-2">
                                <span class="text-yellow-400 mr-1 tracking-tighter">★★★★★</span>
                                <span class="text-sm">{{ location.rating }}/5</span>
                            </div>
                            <p class="text-sm opacity-90">{{ location.descripcion }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex-1 flex flex-col mb-10 mt-5">
            <div v-if="activeLocationData" class="bg-white p-4 border-b border-gray-200 shadow-sm">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-xl font-bold text-green-700">{{ activeLocationData.name }}</h3>
                    <div class="flex items-center">
                        <span class="text-yellow-500 mr-1 tracking-tighter">★★★★★</span>
                        <span class="text-sm text-gray-600">{{ activeLocationData.rating }}/5</span>
                    </div>
                </div>
                <p class="text-gray-600 mb-3">{{ activeLocationData.descripcion }}</p>
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
            </div>

            <div class="flex-1 relative">
            <ClientOnly>
                <LMap
                    v-model:zoom="zoom"
                    :center="center"
                    :options="mapOptions"
                    class="h-full w-full"
                    @contextmenu="handleContextMenu" >
                    <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

                    <LMarker
                        v-for="(location, index) in locations"
                        :key="location.id"
                        :lat-lng="[location.latX, location.lonY]"
                        :icon="greenIcon"
                        @click="selectLocation(index)"
                    >
                        <LPopup>
                            <div class="min-w-32">
                                <h3 class="text-base font-bold text-green-700 mb-1">{{ location.name }}</h3>
                                <div class="flex items-center mb-1">
                                    <span class="text-yellow-500 mr-1 tracking-tighter">★★★★★</span>
                                    <span class="text-sm text-gray-600">{{ location.rating }}/5</span>
                                </div>
                            </div>
                        </LPopup>
                    </LMarker>
                </LMap>
            </ClientOnly>

                <div class="absolute top-5 right-5 flex flex-col z-1000 gap-1 ">
                    <button
                        class="w-8 h-8 bg-white rounded flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer text-green-700 font-bold"
                        @click="zoom += 1">
                        +
                    </button>
                    <button
                        class="w-8 h-8 bg-white rounded flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer text-green-700 font-bold"
                        @click="zoom -= 1">
                        -
                    </button>
                    <button
                        class="w-8 h-8 bg-white rounded flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer text-green-700 font-bold"
                        @click="startNewPointCreation" title="Añadir nuevo punto">
                        <Icon name="material-symbols:add-location-alt"/>
                    </button>
                </div>
            </div>
        </div>


        <div v-if="isCreatingNew" class="fixed inset-0 flex items-center justify-center z-1000">
            <div class="absolute inset-0 bg-black/20" @click="cancelNewPoint"></div>
            <div class="bg-white p-6 rounded-md shadow-lg z-1000 w-96 relative">
                <h3 class="text-lg font-bold mb-3 text-green-700">Nuevo Punto</h3>
                <div class="mb-3">
                    <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
                    <input type="text" id="name" v-model="newPointName" placeholder="Nombre del lugar"
                        class="shadow border-1 hover:border-green-600 border-gray-200 transition duration-500 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div class="mb-4">
                    <label for="description" class="block text-gray-700 text-sm font-bold mb-2">Descripción:</label>
                    <textarea id="description" v-model="newPointDescription" placeholder="Descripción del lugar"
                        class="shadow appearance-none border-1 hover:border-green-600 transition duration-500 border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                </div>
                <div class="mb-4">
                    <label for="image" class="block text-gray-700 text-sm font-bold mb-2">Imagen:</label>
                    <input id="image" v-model="newPointImage" placeholder="Url de la imagen"
                        class="shadow appearance-none border-1 hover:border-green-600 transition duration-500 border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                </div>
                <div class="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label for="latX" class="block text-gray-700 text-sm font-bold mb-2">Latitud:</label>
                        <input type="number" id="latX" step="0.000001" 
                            :value="newPointCoords ? newPointCoords[0] : 40.416775"
                            @input="e => updateCoords(0, e.target.value)"
                            class="shadow appearance-none border-1 hover:border-green-600 transition duration-500 border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div>
                        <label for="lonY" class="block text-gray-700 text-sm font-bold mb-2">Longitud:</label>
                        <input type="number" id="lonY" step="0.000001" 
                            :value="newPointCoords ? newPointCoords[1] : -3.703790"
                            @input="e => updateCoords(1, e.target.value)"
                            class="shadow appearance-none border-1 hover:border-green-600 transition duration-500 border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                </div>
                <div class="mb-4">
                    <p class="text-sm text-gray-700">
                        Las coordenadas introducidas se mostrarán en el mapa una vez guardado el punto.
                    </p>
                </div>
                <div class="flex justify-end gap-2">
                    <button @click="cancelNewPoint"
                        class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Cancelar
                    </button>
                    <button @click="saveNewPoint"
                        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        :disabled="!newPointCoords || !newPointName || !newPointDescription || !newPointImage">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
        
    </div>
    <footer>
      <div
        class=" text-gray-800 bg-green-700/50 px-5 py-3 items-center justify-between shadow-md">
        <div class="items-center">
          <span class="text-sm">© 2023 GreenMaps</span>
        </div>
      </div>
    </footer>
</template>

<style>

html, body, #__nuxt, #__layout {
    height: 100%;
    margin: 0;
    padding: 0;
}

.flex {
    display: flex;
}

.flex-1 {
    flex: 1;
}

.flex.bg-gray-50 {
    min-height: 100vh;
    height: 100%;
}

.bg-gradient-to-b {
    min-height: 100vh;
    width: 300px; 
}

.h-full {
    height: 100%;
}

.leaflet-pane {
    z-index: 400;
}

.leaflet-top,
.leaflet-bottom {
    z-index: 450;
}

.z-1000 {
    z-index: 1000;
}
</style>