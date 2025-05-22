<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  location: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select']);

const handleSelect = () => {
  emit('select');
};

const truncatedDescription = computed(() => {
  if (!props.location.description) return '';
  return props.location.description.length > 100
    ? props.location.description.substring(0, 100) + '...'
    : props.location.description;
});
</script>

<template>
  <div :class="[
    'bg-white/10 rounded-lg p-4 mb-4 cursor-pointer transition-all hover:bg-white/20 hover:-translate-y-1',
    { 'border-l-4 border-sky-300 bg-white/20': isActive },
  ]" @click="handleSelect">
    <div class="relative mb-3">
      <img :src="location.image" :alt="location.name" class="w-full h-32 object-cover rounded-md" />
    </div>
    <div>
      <div class="flex items-center justify-between">
        <h4 class="font-bold text-base mb-1">{{ location.name }}</h4>
      </div>
      <div class="flex items-center mb-2">
        <span class="text-amber-400 mr-1 tracking-tighter">★★★★★</span>
        <span class="text-sm">{{ location.rating }}/5</span>
      </div>
      <p class="text-sm opacity-90">{{ truncatedDescription }}</p>
    </div>
  </div>
</template>