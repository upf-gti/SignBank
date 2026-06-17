<template>
  <q-header
    class="bg-secondary text-black app-header"
    bordered
  >
    <loginComponent v-model="isLoginDialogOpen" />

    <q-drawer
      v-model="isSidebarOpen"
      side="right"
      :width="280"
      bordered
      overlay
      class="bg-secondary"
    >
      <q-list padding>
        <q-item-label
          header
          class="text-grey-7"
        >
          {{ translate('navigation') }}
        </q-item-label>

        <q-item
          v-if="route.path !== '/search' && route.path !== '/'"
          clickable
          v-ripple
          :active="isActive('/search')"
          active-class="nav-item-active"
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
          :active="isActive('/my-requests')"
          active-class="nav-item-active"
          @click="navigateTo('/my-requests')"
        >
          <q-item-section avatar>
            <q-icon name="add" />
          </q-item-section>
          <q-item-section>{{ translate('createEntry') }}</q-item-section>
        </q-item>

        <template v-if="userStore.isAdmin && userStore.isLoggedIn">
          <q-separator class="q-my-sm" />

          <q-item-label
            header
            class="text-grey-7"
          >
            {{ translate('admin') }}
          </q-item-label>

          <q-item
            clickable
            v-ripple
            :active="isActive('/confirm-requests')"
            active-class="nav-item-active"
            @click="navigateTo('/confirm-requests')"
          >
            <q-item-section avatar>
              <q-icon name="check_circle" />
            </q-item-section>
            <q-item-section>{{ translate('confirmRequests') }}</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :active="isActive('/user-management')"
            active-class="nav-item-active"
            @click="navigateTo('/user-management')"
          >
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>{{ translate('userManagement') }}</q-item-section>
          </q-item>
        </template>
      </q-list>

      <div class="absolute-bottom q-pa-md">
        <q-separator class="q-mb-sm" />
        <q-item
          v-if="!userStore.isLoggedIn"
          clickable
          v-ripple
          @click="openLogin"
          class="rounded-borders"
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

    <q-toolbar class="row no-wrap items-center">
      <q-toolbar-title class="col row items-center no-wrap q-gutter-sm">
        <q-img
          src="https://dlc.iec.cat/img/LOGO_IEC2.png"
          style="width: 44px; height: 44px;"
          fit="contain"
          alt="IEC"
        />
        <q-img
          class="header-logo cursor-pointer"
          src="https://www.upf.edu/o/upf-2016-theme/images/upf/logo.png"
          style="width: 90px; height: 36px;"
          fit="contain"
          alt="UPF"
          @click="navigateTo('/')"
        />
      </q-toolbar-title>

      <q-btn
        flat
        dense
        round
        :icon="isSidebarOpen ? 'close' : 'menu'"
        :aria-label="isSidebarOpen ? translate('closeMenu') : translate('openMenu')"
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

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')
</script>

<style scoped>
.app-header {
  min-height: 64px;
  box-shadow: none;
}

.header-logo {
  transition: transform 0.2s;
}

.header-logo:hover {
  transform: scale(1.05);
}

.nav-item-active {
  background: rgba(200, 16, 47, 0.08);
  color: var(--primary);
  font-weight: 500;
}

.q-drawer {
  z-index: 2000;
}

@media (max-width: 599px) {
  .header-logo {
    width: 70px !important;
  }

  .q-toolbar {
    padding: 0 8px;
  }
}

@media (min-width: 600px) {
  .q-drawer {
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
