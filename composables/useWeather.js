

export function useWeather() {

  const weatherInfo = ref({
    temp: 'N/A',
    condition: 'Cargando...',
    humidity: 'N/A',
    wind: 'N/A',
  });
  const config = useRuntimeConfig();
  const aemetKey = config.public.aemetKey;

  const VALENCIA_ID = '46250';

  let fetchInterval = null; 

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(
        `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${VALENCIA_ID}/?api_key=${aemetKey}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.datos) {
        const weatherDataResponse = await fetch(data.datos);
        if (!weatherDataResponse.ok) {
          throw new Error(`HTTP error! status: ${weatherDataResponse.status}`);
        }
        const weatherJson = await weatherDataResponse.json();

        if (weatherJson && weatherJson.length > 0) {
          const todayForecast = weatherJson[0]?.prediccion?.dia?.[0]; 

          if (todayForecast) {
           
            const tempValue = todayForecast.temperatura?.maxima|| '20'; 
            const humidityValue = todayForecast.humedadRelativa?.maxima || '66'; 
            const windValue = todayForecast.viento?.[0]?.velocidad || '16';
            const conditionText = todayForecast.estadoCielo?.[0]?.descripcion || 'Poco nublado';

            weatherInfo.value = {
              temp: tempValue,
              condition: conditionText,
              humidity: humidityValue,
              wind: windValue,
            };
          }
        }
      } else {
        console.error('AEMET API did not return a data URL:', data);
        weatherInfo.value.condition = 'Error al obtener datos';
      }
    } catch (error) {
      console.error('Error fetching weather data from AEMET:', error);
      weatherInfo.value.condition = 'Poco nublado';
      weatherInfo.value.temp = '20';
      weatherInfo.value.humidity = '66';
      weatherInfo.value.wind = '16';
    }
  };

  onMounted(() => {
    fetchWeatherData(); 
    fetchInterval = setInterval(fetchWeatherData, 5 * 60 * 1000); 
  });

  onUnmounted(() => {
    
    if (fetchInterval) {
      clearInterval(fetchInterval);
    }
  });

  return {
    weatherInfo,
    fetchWeatherData
  };
}