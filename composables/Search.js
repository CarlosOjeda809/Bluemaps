export function search() {


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

    return {
        searchPlaces,
        clearSearchResults
    }
}