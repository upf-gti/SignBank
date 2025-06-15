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


      <q-space />

      <q-btn-group
        class="col justify-end"
        flat
      >
        <q-btn
          v-if="route.path !== '/search' && route.path !== '/'"
          flat
          :label="translate('searchGloss')"
          @click="$router.push('/search')"
        />
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import loginComponent from '../components/loginComponent.vue'
import useUser from 'src/stores/user.store'
import translate from 'src/utils/translate'

const userStore = useUser()
const route = useRoute()
const isLoginDialogOpen = ref(false)
</script>

<style scoped>
.header-logo {
  width: 100px;
  transition: transform 0.2s;
}

.q-btn {
  margin: 0 4px;
}
</style>