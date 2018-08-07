const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout'),
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
      { path: '/executors/:executorId/taskdefs/:taskDefId',
        component: () => import('pages/TaskDef')
      },
      {
        path: '/plans',
        component: () => import('pages/Plans')
      },
      {
        path: '/plans/:planId',
        component: () => import('pages/Plan')
      },
      {
        path: '/plans/:planId/tasks/:taskId',
        component: () => import('pages/Task')
      }
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
