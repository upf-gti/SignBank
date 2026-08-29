<template>
  <q-layout view="lfh Lpr lFf">
    <HeaderComponent />
    <q-page-container class="page-container">
      <router-view v-if="userStore.isLoggedIn" />
    </q-page-container>
    <loginComponent
      :model-value="showLoginDialog"
      :mandatory="!userStore.isLoggedIn"
      @update:model-value="onLoginDialogUpdate"
    />
  </q-layout>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import HeaderComponent from 'components/HeaderComponent.vue';
import loginComponent from 'components/loginComponent.vue';
import useUser from 'src/stores/user.store';

const userStore = useUser();
const isLoginDialogOpen = ref(false);

const showLoginDialog = computed(() => !userStore.isLoggedIn || isLoginDialogOpen.value);

function openLogin() {
  isLoginDialogOpen.value = true;
}

function onLoginDialogUpdate(value: boolean) {
  if (userStore.isLoggedIn) {
    isLoginDialogOpen.value = value;
  }
}

provide('openLogin', openLogin);
</script>

<style scoped>
.page-container {
  background: var(--sb-bg);
}
</style>
