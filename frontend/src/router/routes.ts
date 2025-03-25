import useUser from 'src/stores/user.store'
import type { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/results',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ResultsPage.vue') }],
  },
  {
    path: '/word/:word',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/WordPage.vue') }],
  },
  {
    path: '/request',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/RequestPage.vue') }],
    beforeEnter: (to, from, next) => {
      if (!useUser().isLoggedIn) {
        next('/')
      } else {
        next()
      }
    }
  },
  {
    path: '/confirm',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ConfirmRequestPage.vue') }],
    beforeEnter: (to, from, next) => {
      if (!useUser().isAdmin) {
        next('/');
      } else {
        next();
      }
    }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
