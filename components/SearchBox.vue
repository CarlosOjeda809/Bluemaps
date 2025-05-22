<script setup>
import { ref } from 'vue';

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['search', 'update:value']);

const searchInput = ref(props.value);

const updateValue = (e) => {
  searchInput.value = e.target.value;
  emit('update:value', searchInput.value);
};

const handleSearch = () => {
  emit('search');
};

const handleKeyUp = (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
};
</script>

<template>
  <div class="search-box bg-white/90 rounded-md shadow-md p-2">
    <div class="flex flex-row items-center justify-center">
      <input type="text" :value="searchInput" @input="updateValue" @keyup="handleKeyUp" placeholder="Buscar lugares..."
        class="shadow appearance-none border rounded w-full p-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
      <button @click="handleSearch"
        class="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-bold p-2 justify-center items-center m-1 rounded focus:outline-none focus:shadow-outline transition-colors">
        <span class="flex ">
          <Icon name="material-symbols:search"  />
        </span>
      </button>
    </div>
  </div>
</template>