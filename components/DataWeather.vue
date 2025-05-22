<script setup>
import { useWeather } from '~/composables/useWeather';

const { weatherInfo } = useWeather();
</script>

<template>
  <div class="weather-widget bg-white/10 rounded-lg p-4 mb-4">
    <h3 class="text-lg font-medium mb-3">Tiempo actual</h3>
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center">
        <div class="mr-3">
          <Icon name="material-symbols:sunny" class="text-3xl text-amber-300" />
        </div>
        <div>
          <p class="text-2xl font-bold">{{ weatherInfo.temp }}º</p>
          <p class="text-sm">{{ weatherInfo.condition }}☁</p>
        </div>
      </div>
    </div>
    <div class=" flex gap-3 flex-wrap text-sm">
      <div class="flex items-center">
        <Icon name="material-symbols:water-drop" />
        <span>Humedad: {{ weatherInfo.humidity }}%</span>
      </div>
      <div class="flex items-center">
        <Icon name="material-symbols:air" />
        <span>Viento: {{ weatherInfo.wind }}km/h</span>
      </div>
    </div>
  </div>
</template>