<script setup>
const props = defineProps({
  showToggle: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['toggle']);

const handleToggle = () => {
  emit('toggle');
};
</script>

<template>
  <div class="sidebar-header flex items-center justify-between mb-4">
    <h2 class="text-2xl font-bold text-center pb-2">Explora España</h2>
    <button v-if="showToggle" @click="handleToggle"
      class="text-white rounded-full p-1 hover:bg-white/10 transition-colors" title="Ocultar/Mostrar barra lateral">
      <Icon name="material-symbols:menu" class="text-xl" />
    </button>
  </div>
</template>