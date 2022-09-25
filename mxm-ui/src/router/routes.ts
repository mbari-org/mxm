import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'ProvidersPage',
        component: () => import('pages/providers/ProvidersPage.vue'),
      },
      {
        path: '/:providerId',
        name: 'ProviderPage',
        component: () => import('pages/providers/ProviderPage.vue'),
      },
      {
        path: '/:providerId/mt',
        name: 'MissionTemplatesPageRoot',
        component: () =>
          import('pages/providers/MissionTemplatesOrTemplatePage.vue'),
      },
      {
        path: '/:providerId/mt/:missionTplId',
        name: 'MissionTemplatesPageWithId',
        component: () =>
          import('pages/providers/MissionTemplatesOrTemplatePage.vue'),
      },
      {
        path: '/:providerId/mt/:missionTplId/p/:paramName',
        name: 'ParameterPage',
        component: () => import('pages/providers/ParameterPage.vue'),
      },
      {
        path: '/:providerId/m',
        name: 'MissionsPage',
        component: () => import('pages/providers/MissionsPage.vue'),
      },
      {
        path: '/:providerId/mt/:missionTplId/m/:missionId',
        name: 'MissionPage',
        component: () => import('pages/providers/MissionPage.vue'),
      },
      {
        path: '/:providerId/ac',
        name: 'AssetClassesPage',
        component: () => import('pages/providers/AssetClassesPage.vue'),
      },
      {
        path: '/:providerId/ac/:className',
        name: 'AssetClassPage',
        component: () => import('pages/providers/AssetClassPage.vue'),
      },
      {
        path: '/:providerId/a',
        name: 'AssetsPage',
        component: () => import('pages/providers/AssetsPage.vue'),
      },
      {
        path: '/:providerId/a/:assetId',
        name: 'AssetPage',
        component: () => import('pages/providers/AssetPage.vue'),
      },
      {
        path: '/:providerId/u',
        name: 'UnitsPage',
        component: () => import('pages/providers/UnitsPage.vue'),
      },
      {
        path: '/:providerId/u/:unitName',
        name: 'UnitPage',
        component: () => import('pages/providers/UnitPage.vue'),
      },
      {
        path: '/qmaptest',
        name: 'qmaptest',
        component: () => import('pages/QMapTestPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
