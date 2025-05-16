<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    locations: Array,
    activeLocation: Number
});
const emit = defineEmits(['select']);
const selectLocation = (index) => emit('select', index);
</script>

<template>
    <div class="py-5 mb-10">
        <h3 class="text-lg font-medium mb-3">Lugares destacados</h3>
        <div v-for="(location, index) in locations" :key="location.id" :class="[
            'bg-white/10 rounded-lg p-4 mb-4 cursor-pointer transition-all hover:bg-white/20 hover:-translate-y-1',
            { 'border-l-4 border-green-300 bg-white/20': activeLocation === index }
        ]" @click="selectLocation(index)">
            <div class="relative mb-3">
                <img :src="location.image" :alt="location.name" class="w-full h-32 object-cover rounded-md" />
            </div>
            <div>
                <div class="flex items-center justify-between">
                    <h4 class="font-bold text-base mb-1">{{ location.name }}</h4>
                </div>
                <div class="flex items-center mb-2">
                    <span class="text-yellow-400 mr-1 tracking-tighter">★★★★★</span>
                    <span class="text-sm">{{ location.rating }}/5</span>
                </div>
                <p class="text-sm opacity-90">{{ location.description }}</p>
            </div>
        </div>
    </div>
</template>