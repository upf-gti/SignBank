import useUser from 'src/stores/user.store'
import type { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/register',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/RegisterPage.vue') }],
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
    path: '/requests',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/RequestPage.vue') },
      { path: 'create', component: () => import('pages/CreateRequestPage.vue') },
      { path: ':id', component: () => import('pages/EditRequestPage.vue') },
    ],
    beforeEnter: (to, from, next) => {
      if (!useUser().isLoggedIn) {
        next('/')
      } else {
        next()
      }
    }
  },
  {
    path: '/confirm-requests',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ConfirmRequest/IndexPage.vue') },
      { path: ':id', component: () => import('pages/ConfirmRequest/EditPage.vue') }
    ],
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
