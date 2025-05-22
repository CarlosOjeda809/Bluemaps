import { ref, computed } from 'vue';
import { useSupabaseClient } from '#imports';

export function useLocation() {
  const client = useSupabaseClient();
  const locations = ref([]);
  const activeLocation = ref(0);

  const getLocations = async () => {
    const { data: dataLocation, error: errorLocation } = await client
      .from('locations')
      .select('*');

    if (errorLocation) {
      console.error('Error al obtener ubicaciones:', errorLocation);
      return;
    }

    locations.value = dataLocation;

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
    return [locations.value[index].latx, locations.value[index].lony];
  };

  const deleteLocation = async () => {
    const locationToDelete = locations.value[activeLocation.value];

    if (locationToDelete) {
      const province = locationToDelete.province;

      const { error } = await client
        .from('locations')
        .delete()
        .eq('id', locationToDelete.id);

      if (error) {
        console.error('Error al eliminar la ubicación:', error);
        alert('Error al eliminar la ubicación. Inténtalo de nuevo.');
        return false;
      }

      const { data: dataLocation, error: errorLocation } = await client
        .from('locations')
        .select('*')
        .eq('province', province);

      if (errorLocation) {
        console.error('Error al obtener ubicaciones:', errorLocation);
        return false;
      }

      locations.value = dataLocation;

      if (locations.value.length > 0) {
        selectLocation(0);
      } else {
        activeLocation.value = -1;
      }
      return true;
    }
    return false;
  };

  const activeLocationData = computed(() => {
    return locations.value[activeLocation.value];
  });

  const addLocation = (location) => {
    locations.value.push(location);
  };

  return {
    locations,
    activeLocation,
    activeLocationData,
    getLocations,
    selectLocation,
    deleteLocation,
    addLocation
  };
}