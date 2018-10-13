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
