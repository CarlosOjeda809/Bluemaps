<script setup>

import Navbar from './components/Navbar.vue';
import Footer from '~/components/Footer.vue';

</script>

<template>
  
  <div class="flex-col flex-h-screen">
    <Navbar />
    <NuxtPage class="h-full flex-1"/>
    <Footer />
  </div>
</template>
