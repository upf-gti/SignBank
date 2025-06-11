<template>
  <q-header
    class="bg-secondary text-black"
    style="height: 10vh"
  >
    <loginComponent v-model="isLoginDialogOpen" />
    <q-toolbar class="row no-wrap">
      <q-toolbar-title class="col">
        <q-img
          src="https://dlc.iec.cat/img/LOGO_IEC2.png"
          class="q-ma-md"
          style="width: 50px;"
        />
        <q-img
          class="header-logo cursor-pointer q-mr-md"
          src="https://www.upf.edu/o/upf-2016-theme/images/upf/logo.png"
          @click="$router.push('/')"
        />
      </q-toolbar-title>

      <q-form
        v-if="shouldShowSearch"
        class="search-container row no-wrap col"
        @submit="onSubmit"
      >
        <q-input
          v-model="search"
          outlined
          dense
          :placeholder="translate('search')"
          class="header-search"
        >
          <template #append>
            <q-btn
              icon="search"
              flat
            />
          </template>
        </q-input>
      </q-form>
      <q-space />

      <q-btn-group
        class="col justify-end"
        flat
      >
        <q-btn
          v-if="userStore.isLoggedIn" 
          flat
          :label="translate('requestWord')"
          @click="$router.push('/my-requests')"
        />
        <q-btn
          v-if="userStore.isAdmin && userStore.isLoggedIn"
          flat
          :label="translate('confirmRequests')"
          @click="$router.push('/confirm-requests')"
        />
        <q-btn
          v-if="!userStore.isLoggedIn"
          flat
          :label="translate('login')"
          icon="login"
          @click="isLoginDialogOpen = true"
        />
        <q-btn
          v-if="userStore.isLoggedIn"
          flat
          :label="translate('logout')"
          icon="logout"
          @click="userStore.logout"
        />
      </q-btn-group>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import loginComponent from '../components/loginComponent.vue';
import useUser from 'src/stores/user.store'
import translate from 'src/utils/translate'
import { apiClient } from 'src/boot/axios'

const userStore = useUser()
const route = useRoute()
const router = useRouter();
const isLoginDialogOpen = ref(false)
const search = ref('')

const shouldShowSearch = computed(() => {
  return !['/'].includes(route.path)
})

import { useRouter } from 'vue-router';


const onSubmit = async () => {
  if (search.value.trim()) {
    // If we're already on the results page, replace the current route
    if (route.path === '/results') {
      await router.replace({
        path: '/results',
        query: { search: search.value.trim() }
      });
      // Optionally, emit an event that the parent component can listen to
      // to refresh the search results
      window.dispatchEvent(new Event('search-updated'));
    } else {
      await router.push({
        path: '/results',
        query: { search: search.value.trim() }
      });
    }
  }
};

onMounted(() => {
  console.log(apiClient.defaults)
})
</script>

<style scoped>
.header-logo {
  width: 100px;
  transition: transform 0.2s;
}


.search-container {
  width: 40%;
  max-width: 500px;
}

.header-search {
  width: 100%;
}

.q-btn {
  margin: 0 4px;
}
</style>