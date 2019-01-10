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
      { path: '/:executorId/missiontpls/:missionTplId',
        component: () => import('pages/MissionTpl')
      },
      { path: '/:executorId/missiontpls',
        component: () => import('pages/MissionTpls')
      },
      { path: '/:executorId/missiontpls/:missionTplId/params/:paramName',
        component: () => import('pages/Parameter')
      },
      {
        path: '/:executorId/missions',
        component: () => import('pages/Missions')
      },
      {
        path: '/:executorId/missiontpls/:missionTplId/missions/:missionId',
        component: () => import('pages/Mission')
      },
      {
        path: '/:executorId/assetclasses',
        component: () => import('pages/AssetClasses')
      },
      {
        path: '/:executorId/assetclasses/:className',
        component: () => import('pages/AssetClass')
      },
      {
        path: '/:executorId/assets',
        component: () => import('pages/Assets')
      },
      {
        path: '/:executorId/assets/:assetId',
        component: () => import('pages/Asset')
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
