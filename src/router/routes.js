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
      { path: '/executors/:executorId/missiondefs/:missionDefId',
        component: () => import('pages/MissionDef')
      },
      { path: '/executors/:executorId/missiondefs/:missionDefId/params/:paramName',
        component: () => import('pages/Parameter')
      },
      {
        path: '/missions',
        component: () => import('pages/Missions')
      },
      {
        path: '/missions/:missionId',
        component: () => import('pages/Mission')
      },
      {
        path: '/assetclasses',
        component: () => import('pages/AssetClasses')
      },
      {
        path: '/assetclasses/:className',
        component: () => import('pages/AssetClass')
      },
      {
        path: '/assets',
        component: () => import('pages/Assets')
      },
      {
        path: '/assets/:assetId',
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
