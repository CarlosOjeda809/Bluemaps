export function handlers() {
    
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

return {
    handleContextMenu,
    handleMapReady
}
}