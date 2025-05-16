<script setup>
const weatherInfo = ref({
    temp: '22°C',
    condition: 'Soleado',
    humidity: '45%',
    wind: '12 km/h'
});

</script>

<template>
    <div class="bg-white/10 rounded-lg p-4 mb-5">
        <h3 class="text-lg font-medium mb-2">Clima actual</h3>
        <div class="flex items-center">
            <div class="text-3xl font-bold mr-5">{{ weatherInfo.temp }}</div>
            <div class="text-sm">
                <p>{{ weatherInfo.condition }}</p>
                <p>Humedad: {{ weatherInfo.humidity }}</p>
                <p>Viento: {{ weatherInfo.wind }}</p>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped></style>
