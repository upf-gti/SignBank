<script setup lang="ts">
import headerComponent from './components/headerComponent.vue'
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="body">
    <headerComponent />
    <RouterView />
  </div>
</template>

<style scoped>
@import url('css/app.css');

.body {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100dvw;
}
</style>
