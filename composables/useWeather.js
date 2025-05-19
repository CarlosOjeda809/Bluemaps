export function useWeather() {
  const weatherInfo = ref({
    temp: '22°C',
    condition: 'Soleado',
    humidity: '45%',
    wind: '12 km/h'
  });

  const updateWeather = async (lat, lng) => {
    return weatherInfo.value;
  };

  return {
    weatherInfo,
    updateWeather
  };
}