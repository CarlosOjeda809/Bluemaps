export function useMap() {
  const center = ref([39.473040, -0.371475]);
  const zoom = ref(13);
  const mapInstance = ref(null);
  const mapReady = ref(false);
  const mapOptions = {
    zoomControl: false,
    attributionControl: true,
  };

  const handleMapReady = async (map) => {
    if (!mapInstance.value || typeof mapInstance.value !== 'object') {
      mapInstance.value = {};
    }
    mapInstance.value.mapObject = map;
    mapReady.value = true;
  };

  const handleContextMenu = (event) => {
    return [event.latlng.lat, event.latlng.lng];
  };

  return {
    center,
    zoom,
    mapInstance,
    mapReady,
    mapOptions,
    handleMapReady,
    handleContextMenu
  };
}