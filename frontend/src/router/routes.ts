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
    path: '/gloss/:gloss',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/GlossPage.vue') }],
  },
  {
    path: '/requests',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/RequestGlossPage.vue') },
      { path: 'create', component: () => import('pages/CreateRequestGlossPage.vue') },
      { path: 'view/:id', component: () => import('pages/ViewRequestGlossPage.vue') }
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
