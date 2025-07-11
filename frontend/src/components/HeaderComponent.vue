<template>
  <q-header
    class="bg-secondary text-black"
    style="height: 10vh"
  >
    <loginComponent v-model="isLoginDialogOpen" />
    
    <!-- Sidebar Navigation -->
    <q-drawer
      v-model="isSidebarOpen"
      side="right"
      :width="280"
      bordered
      overlay
      class="bg-secondary"
    >
      
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
          <q-item-section class="text-caption">{{ translate('searchGloss') }}</q-item-section>
        </q-item>
        
        <q-item
          v-if="userStore.isLoggedIn"
          clickable
          v-ripple
          @click="navigateTo('/my-requests')"
        >
          <q-item-section avatar>
            <q-icon name="add" />
          </q-item-section>
          <q-item-section class="text-caption">{{ translate('createEntry') }}</q-item-section>
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
          <q-item-section class="text-caption">{{ translate('confirmRequests') }}</q-item-section>
        </q-item>
        
        <q-item
          v-if="userStore.isAdmin && userStore.isLoggedIn"
          clickable
          v-ripple
          @click="navigateTo('/user-management')"
        >
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section class="text-caption">{{ translate('userManagement') }}</q-item-section>
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
          <q-item-section class="text-primary text-caption">{{ translate('login') }}</q-item-section>
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
          <q-item-section class="text-negative text-caption">{{ translate('logout') }}</q-item-section>
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

      <!-- Menu Button - Always visible -->
      <q-btn
        flat
        dense
        round
        :icon="isSidebarOpen ? 'close' : 'menu'"
        :aria-label="isSidebarOpen ? 'Close menu' : 'Open menu'"
        @click="isSidebarOpen = !isSidebarOpen"
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

/* Drawer styling for all screen sizes */
.q-drawer {
  z-index: 2000;
}

.q-drawer__content {
  background: var(--q-secondary);
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

/* Desktop drawer adjustments */
@media (min-width: 600px) {
  .q-drawer {
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  }
}
</style>