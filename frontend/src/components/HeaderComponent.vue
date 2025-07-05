<template>
  <q-header
    class="bg-secondary text-black"
    style="height: 10vh"
  >
    <loginComponent v-model="isLoginDialogOpen" />
    
    <!-- Mobile Sidebar -->
    <q-drawer
      v-model="isSidebarOpen"
      side="right"
      :width="250"
      :breakpoint="600"
      bordered
      class="bg-secondary"
    >
      <!-- Close button at the top -->
      <div class="row justify-end q-pa-sm">
        <q-btn
          flat
          round
          dense
          icon="close"
          aria-label="Close menu"
          @click="isSidebarOpen = false"
        />
      </div>
      
      <q-separator />
      
      <q-list padding>
        <q-item
          v-if="route.path !== '/search' && route.path !== '/'"
          clickable
          v-ripple
          @click="navigateTo('/search')"
        >
          <q-item-section avatar>
            <q-icon name="search" />
          </q-item-section>
          <q-item-section>{{ translate('searchGloss') }}</q-item-section>
        </q-item>
        
        <q-item
          v-if="userStore.isLoggedIn"
          clickable
          v-ripple
          @click="navigateTo('/my-requests')"
        >
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>
          <q-item-section>{{ translate('createEntry') }}</q-item-section>
        </q-item>
        
        <q-item
          v-if="userStore.isAdmin && userStore.isLoggedIn"
          clickable
          v-ripple
          @click="navigateTo('/confirm-requests')"
        >
          <q-item-section avatar>
            <q-icon name="check_circle" />
          </q-item-section>
          <q-item-section>{{ translate('confirmRequests') }}</q-item-section>
        </q-item>
      </q-list>
      
      <!-- Authentication buttons at the bottom -->
      <div class="absolute-bottom q-pa-md">
        <q-item
          v-if="!userStore.isLoggedIn"
          clickable
          v-ripple
          @click="openLogin"
          class="rounded-borders q-mb-sm"
        >
          <q-item-section avatar>
            <q-icon name="login" color="primary" />
          </q-item-section>
          <q-item-section class="text-primary">{{ translate('login') }}</q-item-section>
        </q-item>
        
        <q-item
          v-if="userStore.isLoggedIn"
          clickable
          v-ripple
          @click="userStore.logout"
          class="rounded-borders"
        >
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>
          <q-item-section class="text-negative">{{ translate('logout') }}</q-item-section>
        </q-item>
      </div>
    </q-drawer>

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
          @click="navigateTo('/')"
        />
      </q-toolbar-title>

      <q-space />

      <!-- Desktop Navigation -->
      <q-btn-group
        class="col justify-end gt-sm"
        flat
      >
        <q-btn
          v-if="route.path !== '/search' && route.path !== '/'"
          flat
          :label="translate('searchGloss')"
          @click="navigateTo('/search')"
        />
        <q-btn
          v-if="userStore.isLoggedIn"
          flat
          :label="translate('createEntry')"
          @click="navigateTo('/my-requests')"
        />
        <q-btn
          v-if="userStore.isAdmin && userStore.isLoggedIn"
          flat
          :label="translate('confirmRequests')"
          @click="navigateTo('/confirm-requests')"
        />
        <q-btn
          v-if="!userStore.isLoggedIn"
          flat
          :label="translate('login')"
          icon="login"
          @click="openLogin"
        />
        <q-btn
          v-if="userStore.isLoggedIn"
          flat
          :label="translate('logout')"
          icon="logout"
          @click="userStore.logout"
        />
      </q-btn-group>

      <!-- Mobile Menu Button -->
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        class="lt-md"
        @click="isSidebarOpen = true"
      />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import loginComponent from '../components/loginComponent.vue'
import useUser from 'src/stores/user.store'
import translate from 'src/utils/translate'

const userStore = useUser()
const route = useRoute()
const router = useRouter()
const isLoginDialogOpen = ref(false)
const isSidebarOpen = ref(false)

const navigateTo = (path: string) => {
  router.push(path)
  isSidebarOpen.value = false
}

const openLogin = () => {
  isLoginDialogOpen.value = true
  isSidebarOpen.value = false
}
</script>

<style scoped>
.header-logo {
  width: 100px;
  transition: transform 0.2s;
}

.header-logo:hover {
  transform: scale(1.05);
}

.q-btn {
  margin: 0 4px;
}

/* Mobile responsive adjustments */
@media (max-width: 599px) {
  .header-logo {
    width: 80px;
  }
  
  .q-toolbar {
    padding: 0 8px;
  }
}
</style>