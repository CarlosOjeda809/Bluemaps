<script setup>
import { ref, onMounted } from 'vue';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const { center, zoom, mapInstance, mapReady, mapOptions, handleMapReady } = useMap();
const { locations, activeLocation, activeLocationData, getLocations, selectLocation, deleteLocation } = useLocation();
const { searchInput, placesService, placesContainer, loadGoogleMaps, searchPlaces } = useSearch();
const { addNewPoint, newPointCoords, setNewPointCoords, resetNewPoint } = usePointCreation();
const { weatherInfo } = useWeather();

const showSidebar = ref(true);
const config = useRuntimeConfig();
const mapskey = config.public.mapsKey;
const manualLocationVisible = ref(false);

const handleSelectLocation = (index) => {
    const newCenter = selectLocation(index);
    center.value = newCenter;
    zoom.value = 15;
};

const handleContextMenu = (event) => {
    setNewPointCoords([event.latlng.lat, event.latlng.lng]);
    addNewPoint.value = true;
};

const initializeMap = async (map) => {
    await handleMapReady(map);
    await loadGoogleMaps(mapskey);

    if (window.google && window.google.maps && window.google.maps.places && placesContainer.value) {
        placesService.value = new window.google.maps.places.PlacesService(placesContainer.value);
    }
};

const handleSearchPlaces = () => {
    searchPlaces(mapInstance.value, mapReady.value);
};

const handleDeleteLocation = async () => {
    await deleteLocation();
};

const handleAddLocation = (val) => {
    locations.value.push(val);
};

const toggleSidebar = () => {
    showSidebar.value = !showSidebar.value;
};

const handleZoomIn = () => {
    zoom.value += 1;
};

const handleZoomOut = () => {
    zoom.value -= 1;
};


const handleAddPointClick = () => {
    manualLocationVisible.value = true;
};

const handleManualLocationSubmit = (coords) => {
    setNewPointCoords(coords);
    addNewPoint.value = true;
    manualLocationVisible.value = false;
}

const handleCloseManualInput = () => {
    manualLocationVisible.value = false;
};

onMounted(async () => {
    await initializeMap();
    await getLocations();

    document.head.appendChild(document.createElement('link')).href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css';
});
</script>

<template>
    <Navbar />
    <main class="flex bg-gray-50 h-screen">
        <aside
            class="bg-gradient-to-b from-green-500 to-green-800 text-white shadow-lg z-10 transition-all duration-300"
            :class="showSidebar ? 'w-80' : 'w-12'">
            <div v-if="showSidebar" class="p-5 h-full overflow-y-auto">
                <SidebarHeader @toggle="toggleSidebar" />
                <DataWeather />
                <div class="py-3 mb-8">
                    <h3 class="text-lg font-medium mb-3">Lugares destacados</h3>
                    <LocationCard v-for="(location, index) in locations" :key="location.id" :location="location"
                        :is-active="activeLocation === index" @select="handleSelectLocation(index)" />
                </div>
            </div>
            <div v-else class="flex justify-center p-2">
                <button @click="toggleSidebar" class="text-white rounded-full p-1 hover:bg-white/10 transition-colors"
                    title="Mostrar barra lateral">
                    <Icon name="material-symbols:menu" class="text-xl" />
                </button>
            </div>
        </aside>

        <div class="flex-1 flex flex-col h-full">
            <LocationDetails :location-data="activeLocationData" @delete="handleDeleteLocation" />

            <div class="flex-1 relative">
                <div class="absolute top-5 left-5 z-1000">
                    <SearchBox v-model:value="searchInput" @search="handleSearchPlaces" />
                </div>

                <ClientOnly>
                    <LMap ref="mapInstance" v-model:zoom="zoom" :center="center" :options="mapOptions"
                        class="w-full h-full" @ready="initializeMap" @contextmenu="handleContextMenu">
                        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        <LMarker v-for="(location, index) in locations" :key="location.id"
                            :lat-lng="[location.latX, location.lonY]" @click="handleSelectLocation(index)">
                            <LPopup>
                                <div class="min-w-32">
                                    <h3 class="text-base font-bold text-green-700 mb-1">{{ location.name }}</h3>
                                    <div class="flex items-center mb-1">
                                        <span class="text-yellow-500 mr-1 tracking-tighter">★★★★★</span>
                                        <span class="text-sm text-gray-600">{{ location.rating }}/5</span>
                                    </div>
                                    <img :src="location.image" :alt="location.name"
                                        class="w-full h-32 object-cover rounded-md mb-2" />
                                </div>
                            </LPopup>
                        </LMarker>
                    </LMap>
                </ClientOnly>

                <div class="absolute top-5 right-5 z-1000">
                    <MapControls @zoom-in="handleZoomIn" @zoom-out="handleZoomOut" @add-point="handleAddPointClick" />
                </div>

                <NewPoint :is-open="manualLocationVisible" :coords="newPointCoords" @close="handleCloseManualInput"
                    @add="handleAddLocation" />

            </div>
        </div>

        <div ref="placesContainer" style="display:none"></div>
    </main>

    <NewPointCoords :is-open="addNewPoint" :coords="newPointCoords" @close="resetNewPoint" @add="handleAddLocation" />

</template>

<style>
html,
body,
#__nuxt,
#__layout {
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
    height: 100vh;
    width: 100%;
}

.h-full {
    height: 100%;
}

.leaflet-container {
    width: 100%;
    height: 100%;
    z-index: 1;
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

.flex-1.relative {
    position: relative;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 60px);
    overflow: hidden;
}
</style>