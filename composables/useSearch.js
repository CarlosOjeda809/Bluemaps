export function useSearch() {
  const searchInput = ref('');
  const placesService = ref(null);
  const searchResults = ref([]);
  const placesContainer = ref(null);

  const loadGoogleMaps = async (mapskey) => {
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

  const initPlacesService = () => {
    if (window.google && window.google.maps && window.google.maps.places && placesContainer.value) {
      placesService.value = new window.google.maps.places.PlacesService(placesContainer.value);
    } else {
      placesService.value = null;
    }
  };

  const clearSearchResults = (mapInstance) => {
    if (mapInstance && mapInstance.mapObject) {
      searchResults.value.forEach(marker => {
        mapInstance.mapObject.removeLayer(marker);
      });
      searchResults.value = [];
    }
  };

  const searchPlaces = async (mapInstance, mapReady) => {
    if (!mapReady || !mapInstance || !mapInstance.mapObject) {
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

    clearSearchResults(mapInstance);

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
            console.log(place.geometry.location);
            bounds.extend([lat, lng]);
          }
        });

        if (bounds.isValid()) {
          mapInstance.mapObject.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 45
          });
        }
      } else {
        alert('No se encontraron resultados para tu búsqueda.');
      }
    });
  };

  return {
    searchInput,
    placesService,
    searchResults,
    placesContainer,
    loadGoogleMaps,
    initPlacesService,
    clearSearchResults,
    searchPlaces
  };
}