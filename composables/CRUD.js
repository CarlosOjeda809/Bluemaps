
const locations = ref([])

export function CRUD() {
    
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


const deleteLocation = async () => {
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

return {
    locations,
    activeLocation,
    center,
    zoom,
    getLocations,
    selectLocation,
    deleteLocation,
}
}