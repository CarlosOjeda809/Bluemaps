
<script setup>
    import { ref, onMounted, computed, nextTick } from 'vue';
    import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';
    
    const client = useSupabaseClient();
    const user = useSupabaseUser();

    const addNewPoint = ref(false)
    const newPointCoords = ref(null)

    const placesContainer = ref(null);
    const center = ref([40.416775, -3.703790]);
    const zoom = ref(13);
    const config = useRuntimeConfig();
    const activeLocation = ref(0);
    const showSidebar = ref(true);
    const isCreatingNew = ref(false);

    const locations = ref([]);
    const mapInstance = ref(null); 
    const searchInput = ref(''); 
    const placesService = ref(null); 
    const mapReady = ref(false);
    const searchResults = ref([]);
    
    const mapOptions = {
        zoomControl: false,
        attributionControl: true,
    };

    const loadGoogleMaps = async () => {
    return new Promise((resolve) => {
        if (window.google && window.google.maps && window.google.maps.places) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCTWd7C7JGTBwgfDx9_wgwLrgasfsKoOUA&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
    });
};
    
const getLocations = async () => {
    const { data: dataLocation, error: errorLocation } = await client
        .from('locations')
        .select('*');

    if (errorLocation) {
        console.error('Error al obtener ubicaciones:', errorLocation);
        
        return;
    }

    locations.value = dataLocation 

    
    if (locations.value.length > 0) {
       
        if (activeLocation.value < 0 || activeLocation.value >= locations.value.length) {
            activeLocation.value = 0;
        }
        
    } else {
        activeLocation.value = -1; 
    }
};
    
    const selectLocation = (index) => {
        activeLocation.value = index;
        center.value = [locations.value[index].latX, locations.value[index].lonY];
        zoom.value = 15;
    };

    
    
    const weatherInfo = ref({
        temp: '22°C',
        condition: 'Soleado',
        humidity: '45%',
        wind: '12 km/h'
    });
    
    const activeLocationData = computed(() => {
        return locations.value[activeLocation.value];
    });
    


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
    
    const handleContextMenu = (event) => {
        newPointCoords.value = [event.latlng.lat, event.latlng.lng];
        addNewPoint.value = true;
    };
    
    const handleMapReady = async (map) => {
    if (!mapInstance.value || typeof mapInstance.value !== 'object') {
        mapInstance.value = {};
    }
    mapInstance.value.mapObject = map;
    mapReady.value = true;

    await loadGoogleMaps();

    if (window.google && window.google.maps && window.google.maps.places && placesContainer.value) {
        placesService.value = new window.google.maps.places.PlacesService(placesContainer.value);
    } else {
        placesService.value = null;
    }
};
    
    
    const clearSearchResults = () => {
        if (mapInstance.value && mapInstance.value.mapObject) {
            searchResults.value.forEach(marker => {
                mapInstance.value.mapObject.removeLayer(marker);
            });
            searchResults.value = [];
        }
    };

    
    const searchPlaces = async () => {
        
    if (!mapReady.value || !mapInstance.value || !mapInstance.value.mapObject) {
        alert('El mapa no está listo. Por favor, intenta de nuevo en unos segundos.');
        return;
    }
    if (!placesService.value) {
        alert('No se pudo inicializar el servicio de búsqueda. Por favor, recarga la página.');
        return;
    }
    if (!searchInput.value.trim()) {
        return;
    }
    clearSearchResults();
    const request = {
        query: searchInput.value,
        fields: ['name', 'geometry', 'formatted_address']
    };
    placesService.value.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const bounds = L.latLngBounds();
            results.forEach(place => {
                if (place.geometry && place.geometry.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    console.log(place.geometry.location)
                    bounds.extend([lat, lng]);
                }
            });
            if (bounds.isValid()) {
                mapInstance.value.mapObject.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 15
                });
            }
        } else {
            alert('No se encontraron resultados para tu búsqueda.');
        }
    });
    
};
    
    onMounted(async () => {

        await handleMapReady()
        await getLocations();
        await loadGoogleMaps();
        
        document.head.appendChild(document.createElement('link')).href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css';
        
    });
</script>

<template>
    <main class="flex bg-gray-50 h-screen">
        <aside class="bg-gradient-to-b from-green-500 to-green-800 text-white shadow-lg z-10 transition-all duration-300">
            <div v-if="showSidebar" class="p-5 h-full overflow-y-auto">
                <h2 class="text-2xl font-bold m-5 text-center pb-2 border-b border-white/20">Explora España</h2>

                <div class="bg-white/10 rounded-lg p-4 mb-5">
                    <h3 class="text-lg font-medium mb-2">Clima actual</h3>
                    <div class="flex items-center">
                        <div class="text-3xl font-bold mr-5">{{ weatherInfo.temp }}</div>
                        <div class="text-sm">
                            <p>{{ weatherInfo.condition }}</p>
                            <p>Humedad: {{ weatherInfo.humidity }}</p>
                            <p>Viento: {{ weatherInfo.wind }}</p>
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
                            <img :src="location.image" :alt="location.name" class="w-full h-32 object-cover rounded-md" />
                        </div>
                        <div>
                            <div class="flex items-center justify-between">
                                <h4 class="font-bold text-base mb-1">{{ location.name }}</h4>
                                
                            </div>
                            <div class="flex items-center mb-2">
                                <span class="text-yellow-400 mr-1 tracking-tighter">★★★★★</span>
                                <span class="text-sm">{{ location.rating }}/5</span>
                            </div>
                            <p class="text-sm opacity-90">{{ location.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>

        <div class="flex-1 flex flex-col mb-10 mt-5">
            <div v-if="activeLocationData" class="bg-white p-4 border-b border-gray-200 shadow-sm">
                <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center space-x-2">
                    <h3 class="text-xl font-bold text-green-700">{{ activeLocationData.name }}</h3>
                    <div @click="deleteLocation" class="flex items-center hover:text-white hover:bg-orange-400 transition rounded-lg duration-500 cursor-pointer bg-gray-100 p-1 shadow-md text-md">
                    <Icon  name="material-symbols:delete" ></Icon>
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
                    <button class="bg-green-700 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-green-800 transition-colors">
                        Ver detalles
                    </button>
                    <button class="border border-green-700 text-green-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-green-50 transition-colors">
                        Cómo llegar
                    </button>
                </div>
            </div>

            <div class="flex-1 relative">
                <div class="absolute top-5 left-5 z-1000 bg-white rounded-md shadow-md p-2">
                    <input type="text" v-model="searchInput" placeholder="Buscar lugares..." class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" @keyup.enter="searchPlaces" />
                    <button @click="searchPlaces" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2">
                        Buscar
                    </button>
                </div>

                <ClientOnly>
                    <LMap ref="mapInstance" v-model:zoom="zoom" :center="center" :options="mapOptions" class="h-full w-full" @ready="handleMapReady" @contextmenu="handleContextMenu">
                        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        <LMarker v-for="(location, index) in locations" :key="location.id" :lat-lng="[location.latX, location.lonY]" @click="selectLocation(index)">
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

                <div class="absolute top-5 right-5 flex flex-col z-1000 gap-1">
                    <button class="w-8 h-8 bg-white rounded flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer text-green-700 font-bold" @click="zoom += 1">
                        +
                    </button>
                    <button class="w-8 h-8 bg-white rounded flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer text-green-700 font-bold" @click="zoom -= 1">
                        -
                    </button>
                    <button @click="addNewPoint = true"
                        class="w-8 h-8 bg-white rounded flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer text-green-700 font-bold"  title="Añadir nuevo punto">
                        <Icon name="material-symbols:add-location-alt" />
                    </button>
                </div>
            </div>
        </div>


        
        
<div ref="placesContainer" style="display:none"></div>
    </main>

    <footer>
        <div class="text-gray-800 bg-green-700/50 px-5 py-3 items-center justify-between shadow-md">
            <div class="items-center">
                <span class="text-sm">© 2023 GreenMaps</span>
            </div>
        </div>
    </footer>

    <NewPoint :is-open="addNewPoint" :coords="newPointCoords" 
        @close="addNewPoint = false; newPointCoords = null" 
        @add="(val) => locations.push(val)"/>
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