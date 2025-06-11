import type { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'search',
        name: 'search',
        component: () => import('pages/SearchPage.vue')
      }
    ],
  },
  {
    path: '/register',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/RegisterPage.vue') }],
  },
  {
    path: '/gloss/:gloss',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/GlossPage.vue') }],
  },
  {
    path: '/my-requests',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/MyRequestsPage.vue') },
      { path: 'create', component: () => import('pages/CreateGlossRequest.vue') },
      { path: 'edit/:id', component: () => import('pages/EditGlossRequest.vue') },
      { path: 'view/:id', component: () => import('pages/ViewRequestGlossPage.vue') },
    ],
  },
  {
    path: '/confirm-requests',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ConfirmRequestsPage.vue') },
      { path: 'review/:id', component: () => import('pages/ReviewGlossRequest.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
