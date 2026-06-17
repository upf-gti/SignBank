<template>
  <q-layout view="lHh Lpr lFf">
    <HeaderComponent />
    <q-page-container class="page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import HeaderComponent from 'components/HeaderComponent.vue';
</script>

<style scoped>
.page-container {
  background: #fafafa;
}
</style>
