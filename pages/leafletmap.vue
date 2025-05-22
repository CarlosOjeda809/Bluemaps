<script setup>
import { ref, onMounted, watch } from 'vue';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { center, zoom, mapInstance, mapReady, mapOptions, handleMapReady } = useMap();
const { locations, activeLocation, activeLocationData, getLocations, selectLocation, deleteLocation } = useLocation();
const { searchInput, placesService, placesContainer, loadGoogleMaps, searchPlaces } = useSearch();
const { addNewPoint, newPointCoords, setNewPointCoords, resetNewPoint } = usePointCreation();
const { weatherInfo, fetchWeatherData } = useWeather();

const showSidebar = ref(true);
const routingControl = ref(null);
const routingLoaded = ref(false);
const config = useRuntimeConfig();
const mapskey = config.public.mapsKey;
const manualLocationVisible = ref(false);
const locationBeingEdited = ref(null);
const selectedProvince = ref('');
const client = useSupabaseClient();
const lastRouteLocation = ref(null);

const loadRoutingMachine = () => {

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js';
    document.head.appendChild(script);

};

const drawRouteBetween = (startCoords, endCoords) => {

    const startLat = parseFloat(startCoords[0]);
    const startLng = parseFloat(startCoords[1]);
    const endLat = parseFloat(endCoords[0]);
    const endLng = parseFloat(endCoords[1]);

    let realMap = mapInstance.value;
    if (!(realMap instanceof L.Map) && realMap.mapObject instanceof L.Map) {
        realMap = realMap.mapObject;
    }

    const waypoint1 = L.latLng(startLat, startLng);
    const waypoint2 = L.latLng(endLat, endLng);

    try {
        routingControl.value = L.Routing.control({
            waypoints: [waypoint1, waypoint2],
            lineOptions: {
                styles: [
                    { color: '#6ebaf0', weight: 6, opacity: 0.8 },
                    { color: '#bed9ed', weight: 3, opacity: 0.9 }
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },

            show: false,
            createMarker: null,
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'foot'
            })
        });

        routingControl.value.on('routesfound', function (e) {
            console.log('🎉 Ruta encontrada:', e.routes.length, 'rutas');
            if (e.routes) {
                const route = e.routes[0];
                const distance = Math.round(route.summary.totalDistance / 1000);
                const time = Math.round(route.summary.totalTime / 60);
                alert(`✅ Ruta calculada: ${distance} km, ${time} minutos`);
            }
        });

        routingControl.value.addTo(realMap);

    } catch (error) {
        console.log('❌ Error creando la ruta: ' + error.message);
    }
};

const filterByProvince = async () => {
    let query = client.from('locations').select('*');

    if (selectedProvince.value) {
        query = query.eq('province', selectedProvince.value);
    }

    const { data } = await query;

    locations.value = data;
    activeLocation.value = null;
    activeLocationData.value = null;
};

const handleSelectLocation = (index) => {
    console.log('Ubicación seleccionada:', index);
    const newCenter = selectLocation(index);
    center.value = newCenter;
    zoom.value = 15;
    activeLocation.value = index;
};

const handleRouteClick = (index, event) => {

    if (!event.originalEvent.ctrlKey) {
        return;
    }
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();

    if (lastRouteLocation.value === null) {
        lastRouteLocation.value = index;
        const locationName = locations.value[index].name;
        alert(`🚩✅ Punto de inicio: ${locationName}.\n\n🚗 Mantén Ctrl y haz click en otro marcador para trazar la ruta.`);
        return;
    }

    if (lastRouteLocation.value !== index) {
        console.log('Trazando ruta entre ubicaciones:', lastRouteLocation.value, 'y', index);

        const fromLocation = locations.value[lastRouteLocation.value];
        const toLocation = locations.value[index];

        const from = [
            parseFloat(fromLocation.latx),
            parseFloat(fromLocation.lony)
        ];

        const to = [
            parseFloat(toLocation.latx),
            parseFloat(toLocation.lony)
        ];

        drawRouteBetween(from, to);

    } else {
        alert('⚠️ Selecciona dos ubicaciones diferentes para trazar una ruta');
    }

    lastRouteLocation.value = null;
};

const clearRoute = () => {
    if (routingControl.value && mapInstance.value) {
        try {
            let realMap = mapInstance.value;
            if (!(realMap instanceof L.Map) && realMap.mapObject instanceof L.Map) {
                realMap = realMap.mapObject;
            }

            if (realMap instanceof L.Map) {
                realMap.removeControl(routingControl.value);
                routingControl.value = null;
                alert('✅ Ruta eliminada del mapa');
            }
        } catch (error) {
            console.warn('Error al eliminar control de ruta:', error);
        }
    }
    lastRouteLocation.value = null;
};

const handleContextMenu = (event) => {
    setNewPointCoords([event.latlng.lat, event.latlng.lng]);
    locationBeingEdited.value = null;
    addNewPoint.value = true;
};

const initializeMap = async (map) => {
    await handleMapReady(map);
};

const handleSearchPlaces = () => {
    searchPlaces(mapInstance.value, mapReady.value);
};

const handleDeleteLocation = async () => {
    await deleteLocation();
};

const handleEditLocation = (locationData) => {
    locationBeingEdited.value = locationData;
    manualLocationVisible.value = true;
};

const handleLocationUpdated = (updatedLocation) => {
    const index = locations.value.findIndex(loc => loc.id === updatedLocation.id);
    if (index !== -1) {
        locations.value[index] = updatedLocation;
        activeLocationData.value = updatedLocation;
    }
    manualLocationVisible.value = false;
    locationBeingEdited.value = null;
};

const handleAddLocation = (val) => {
    locations.value.push(val);
    manualLocationVisible.value = false;
    locationBeingEdited.value = null;
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
    locationBeingEdited.value = null;
    manualLocationVisible.value = true;
};

const handleCloseManualInput = () => {
    manualLocationVisible.value = false;
    locationBeingEdited.value = null;
};

const customIcon = L.icon({
    iconUrl: '/images/icono-3.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

onMounted(async () => {

    await getLocations();
    await fetchWeatherData();
    await loadRoutingMachine();

}); 
</script>

<template>

    <main class="flex bg-gray-100 h-screen">
        <aside class="bg-gradient-to-b from-sky-600 to-blue-800 text-white shadow-lg z-10 transition-all duration-300"
            :class="showSidebar ? 'w-80' : 'w-12'">
            <div v-if="showSidebar" class="p-5 h-full overflow-y-auto">
                <SidebarHeader @toggle="toggleSidebar" />
                <DataWeather />
                <div class="py-3 mb-8">
                    <h3 class="text-lg font-medium mb-3">Lugares destacados</h3>
                    <div class="mb-4">
                        <label class="block text-sm mb-1 font-medium">Filtrar por provincia</label>
                        <select v-model="selectedProvince" @change="filterByProvince"
                            class="w-full px-3 py-2 rounded border-1 border-white text-gray-800 bg-white/90">
                            <section class="text-gray-500">
                                <ProvincesList />
                            </section>
                        </select>
                    </div>
                    <div class="mb-4 p-3 bg-white/10 rounded-lg text-sm">
                        <p class="font-medium mb-2">🗺️ Sistema de Rutas</p>
                        <div class="space-y-1 text-sm mb-3">
                            <p>Click normal: Ver información</p>
                            <p><strong>Ctrl + Click</strong>: Trazar ruta</p>
                            <p class="text-xs opacity-75">1. Ctrl+Click en origen</p>
                            <p class="text-xs opacity-75">2. Ctrl+Click en destino</p>
                        </div>

                        <div class="flex gap-2 mb-3">
                            <button @click="clearRoute"
                                class="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 duration-500 transition cursor-pointer">
                                🗑️ Borrar última ruta
                            </button>
                        </div>

                        <div class="text-xs">
                            <div class="flex items-center gap-1"></div>
                            <p v-if="lastRouteLocation !== null" class="text-orange-200 mt-1">
                                🚩 Origen seleccionado: {{ locations[lastRouteLocation]?.name }}
                            </p>
                        </div>
                    </div>

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
            <LocationDetails :location-data="activeLocationData" @delete="handleDeleteLocation"
                @update="handleEditLocation" />

            <div class="flex-1 relative">
                <div class="absolute top-5 left-5 z-1000">
                    <SearchBox v-model:value="searchInput" @search="handleSearchPlaces" />
                </div>

                <ClientOnly>
                    <LMap ref="mapInstance" v-model:zoom="zoom" :center="center" :options="mapOptions"
                        class="w-full h-full" @ready="initializeMap" @contextmenu="handleContextMenu">
                        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        <template v-for="(location, index) in locations" :key="location.id">
                            <LMarker :lat-lng="[parseFloat(location.latx), parseFloat(location.lony)]"
                                :icon="customIcon" @click="(event) => {
                                    console.log('🖱️ Click en marcador', index);
                                    handleRouteClick(index, event);
                                    if (!event.originalEvent?.ctrlKey) {
                                        handleSelectLocation(index);
                                    }
                                }">
                                <LPopup>
                                    <div class="min-w-32">
                                        <h3 class="text-base font-bold text-sky-700 mb-1">{{ location.name }}</h3>
                                        <div class="flex items-center mb-1">
                                            <span class="text-amber-500 mr-1 tracking-tighter">★★★★★</span>
                                            <span class="text-sm text-gray-600">{{ location.rating }}/5</span>
                                        </div>
                                        <img :src="location.image" :alt="location.name"
                                            class="w-full h-32 object-cover rounded-md mb-2" />
                                        <div
                                            class="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded border-l-4 border-blue-400">
                                            <p class="font-medium">🗺️ Rutas:</p>
                                            <p>Mantén <strong>Ctrl</strong> + Click para trazar rutas</p>
                                            <div class="mt-1 flex items-center gap-1"></div>
                                        </div>
                                    </div>
                                </LPopup>
                            </LMarker>
                        </template>
                    </LMap>
                </ClientOnly>

                <div class="absolute top-5 right-5 z-1000">
                    <MapControls @zoom-in="handleZoomIn" @zoom-out="handleZoomOut" @add-point="handleAddPointClick" />
                </div>

                <NewPoint :is-open="manualLocationVisible" :coords="newPointCoords"
                    :location-to-edit="locationBeingEdited" @close="handleCloseManualInput" @add="handleAddLocation"
                    @updateLocation="handleLocationUpdated" />
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
</style>