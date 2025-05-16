<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import { CRUD } from '@/composables/CRUD';
import { search } from '@/composables/Search';
import { handlers } from '@/composables/handlers';
import 'leaflet/dist/leaflet.css';
import DataWeather from './DataWeather.vue';

const addNewPoint = ref(false)
const newPointCoords = ref(null)
const placesContainer = ref(null);
const center = ref([40.416775, -3.703790]);
const zoom = ref(13);
const activeLocation = ref(0);
const showSidebar = ref(true);
const locations = ref([]);
const mapInstance = ref(null);
const searchInput = ref('');
const activeLocationData = ref(null);
const config = useRuntimeConfig();
const mapOptions = {
    zoomControl: false,
    attributionControl: true,
};



const {
    getLocations,
    selectLocation,
    deleteLocation,
} = CRUD();

const {
    searchPlaces,
    clearSearchResults
} = search();

const {
    handleContextMenu,
    handleMapReady
} = handlers(); ç

const mapskey = config.public.MAPS_KEY

const loadGoogleMaps = async () => {
    return new Promise((resolve) => {
        if (window.google && window.google.maps && window.google.maps.places) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${mapskey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
    });
};

function selectLocation(index) {
    activeLocation.value = index;

}

function deleteActiveLocation() {
    activeLocationData.value = null;
}

onMounted(async () => {

    await handleMapReady()
    await getLocations();
    await loadGoogleMaps();
    document.head.appendChild(document.createElement('link')).href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css';

});
</script>

<template>
    <main class="flex bg-gray-50 h-screen">
        <aside
            class="bg-gradient-to-b from-green-500 to-green-800 text-white shadow-lg z-10 transition-all duration-300">
            <div v-if="showSidebar" class="p-5 h-full overflow-y-auto">
                <h2 class="text-2xl font-bold m-5 text-center pb-2 border-b border-white/20">Explora España</h2>
                <DataWeather />
                <LocationsDetails :locations="locations" :activeLocation="activeLocation" @select="selectLocation" />
            </div>
        </aside>

        <div class="flex-1 flex flex-col mb-10 mt-5">
            <div v-if="activeLocationData" class="bg-white p-4 border-b border-gray-200 shadow-sm">
                <ActiveLocationData :activeLocationData="activeLocationData" @delete="handleDeleteActiveLocation"
                    class="flex-1 relative" />
                <div class="absolute top-5 left-5 z-1000 bg-white rounded-md shadow-md p-2">
                    <input type="text" v-model="searchInput" placeholder="Buscar lugares..."
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        @keyup.enter="searchPlaces" />
                    <button @click="searchPlaces"
                        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2">
                        Buscar
                    </button>
                </div>

                <ClientOnly>
                    <LMap ref="mapInstance" v-model:zoom="zoom" :center="center" :options="mapOptions"
                        class="h-full w-full" @ready="handleMapReady" @contextmenu="handleContextMenu">
                        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        <LMarker v-for="(location, index) in locations" :key="location.id"
                            :lat-lng="[location.latX, location.lonY]" @click="selectLocation(index)">
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
                    <button @click="addNewPoint = true"
                        class="w-8 h-8 bg-white rounded flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer text-green-700 font-bold"
                        title="Añadir nuevo punto">
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

    <NewPoint :is-open="addNewPoint" :coords="newPointCoords" @close="addNewPoint = false; newPointCoords = null"
        @add="(val) => locations.push(val)" />
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