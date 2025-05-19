export function usePointCreation() {
  const addNewPoint = ref(false);
  const newPointCoords = ref(null);
  const isCreatingNew = ref(false);

  const setNewPointCoords = (coords) => {
    newPointCoords.value = coords;
    addNewPoint.value = true;
  };

  const resetNewPoint = () => {
    addNewPoint.value = false;
    newPointCoords.value = null;
  };

  return {
    addNewPoint,
    newPointCoords,
    isCreatingNew,
    setNewPointCoords,
    resetNewPoint
  };
}