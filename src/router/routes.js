const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout'),
    children: [
      {
        path: '', component: () => import('pages/Index')
      },
      {
        path: '/executors',
        component: () => import('pages/Executors')
      },
      {
        path: '/executors/:executorId',
        component: () => import('pages/Executor')
      },
      { path: '/executors/:executorId/missiontpls/:missionTplId',
        component: () => import('pages/MissionTpl')
      },
      { path: '/executors/:executorId/missiontpls',
        component: () => import('pages/MissionTpls')
      },
      { path: '/executors/:executorId/missiontpls/:missionTplId/params/:paramName',
        component: () => import('pages/Parameter')
      },
      {
        path: '/executors/:executorId/missions',
        component: () => import('pages/Missions')
      },
      {
        path: '/executors/:executorId/missiontpls/:missionTplId/missions/:missionId',
        component: () => import('pages/Mission')
      },
      {
        path: '/executors/:executorId/assetclasses',
        component: () => import('pages/AssetClasses')
      },
      {
        path: '/executors/:executorId/assetclasses/:className',
        component: () => import('pages/AssetClass')
      },
      {
        path: '/executors/:executorId/assets',
        component: () => import('pages/Assets')
      },
      {
        path: '/executors/:executorId/assets/:assetId',
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
