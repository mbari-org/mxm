const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout'),
    children: [
      {
        path: '',
        component: () => import('pages/Providers')
      },
      {
        path: '/:providerId',
        component: () => import('pages/Provider')
      },
      {
        path: '/:providerId/mt',
        component: () => import('pages/MissionTplsOrTpl')
      },
      {
        path: '/:providerId/mt/:missionTplId',
        component: () => import('pages/MissionTplsOrTpl')
      },
      {
        path: '/:providerId/mt/:missionTplId/p/:paramName',
        component: () => import('pages/Parameter')
      },
      {
        path: '/:providerId/m',
        component: () => import('pages/Missions')
      },
      {
        path: '/:providerId/mt/:missionTplId/m/:missionId',
        component: () => import('pages/Mission')
      },
      {
        path: '/:providerId/ac',
        component: () => import('pages/AssetClasses')
      },
      {
        path: '/:providerId/ac/:className',
        component: () => import('pages/AssetClass')
      },
      {
        path: '/:providerId/a',
        component: () => import('pages/Assets')
      },
      {
        path: '/:providerId/a/:assetId',
        component: () => import('pages/Asset')
      },
      {
        path: '/:providerId/u',
        component: () => import('pages/Units')
      },
      {
        path: '/:providerId/u/:unitName',
        component: () => import('pages/Unit')
      },
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
