import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'HomePage',
        component: () => import('pages/HomePage.vue'),
      },

      ////////////////////////////////

      {
        path: '/ac',
        name: 'AllAssetClassesPage',
        component: () => import('pages/assets/AllAssetClassesPage.vue'),
      },
      {
        path: '/ac/:className',
        name: 'AssetClassPage',
        component: () => import('pages/assets/AssetClassPage.vue'),
      },
      {
        path: '/a',
        name: 'AssetsPage',
        component: () => import('pages/assets/AssetsPage.vue'),
      },
      {
        path: '/a/:assetId',
        name: 'AssetPage',
        component: () => import('pages/assets/AssetPage.vue'),
      },

      ////////////////////////////////////////////////////////////

      {
        path: '/u',
        name: 'UnitsPage',
        component: () => import('pages/units/UnitsPage.vue'),
      },
      {
        path: '/u/:unitName',
        name: 'UnitPage',
        component: () => import('pages/units/UnitPage.vue'),
      },

      ////////////////////////////////////////////////////////////

      {
        path: '/p',
        name: 'ProvidersPage',
        component: () => import('pages/providers/ProvidersPage.vue'),
      },
      {
        path: '/p/:providerId',
        name: 'ProviderPage',
        component: () => import('pages/providers/ProviderPage.vue'),
      },
      {
        path: '/p/:providerId/mt',
        name: 'MissionTemplatesPageRoot',
        component: () =>
          import('pages/providers/MissionTemplatesOrTemplatePage.vue'),
      },
      {
        path: '/p/:providerId/mt/:missionTplId',
        name: 'MissionTemplatesPageWithId',
        component: () =>
          import('pages/providers/MissionTemplatesOrTemplatePage.vue'),
      },
      {
        path: '/p/:providerId/mt/:missionTplId/p/:paramName',
        name: 'ParameterPage',
        component: () => import('pages/providers/ParameterPage.vue'),
      },
      {
        path: '/p/:providerId/m',
        name: 'MissionsPage',
        component: () => import('pages/providers/MissionsPage.vue'),
      },
      {
        path: '/p/:providerId/mt/:missionTplId/m/:missionId',
        name: 'MissionPage',
        component: () => import('pages/providers/MissionPage.vue'),
      },
      {
        path: '/p/:providerId/ac',
        name: 'AssetClassesPage',
        component: () => import('pages/providers/AssetClassesPage.vue'),
      },

      ////////////////////////////////////////////////////////////

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
