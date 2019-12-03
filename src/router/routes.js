const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout'),
    children: [
      {
        path: '',
        component: () => import('pages/Executors')
      },
      {
        path: '/:executorId',
        component: () => import('pages/Executor')
      },
      { path: '/:executorId/mt/:missionTplId',
        component: () => import('pages/MissionTpl')
      },
      { path: '/:executorId/mt',
        component: () => import('pages/MissionTpls')
      },
      { path: '/:executorId/mt/:missionTplId/p/:paramName',
        component: () => import('pages/Parameter')
      },
      {
        path: '/:executorId/m',
        component: () => import('pages/Missions')
      },
      {
        path: '/:executorId/mt/:missionTplId/m/:missionId',
        component: () => import('pages/Mission')
      },
      {
        path: '/:executorId/ac',
        component: () => import('pages/AssetClasses')
      },
      {
        path: '/:executorId/ac/:className',
        component: () => import('pages/AssetClass')
      },
      {
        path: '/:executorId/a',
        component: () => import('pages/Assets')
      },
      {
        path: '/:executorId/a/:assetId',
        component: () => import('pages/Asset')
      },
      {
        path: '/:executorId/u',
        component: () => import('pages/Units')
      },
      {
        path: '/:executorId/u/:unitName',
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
