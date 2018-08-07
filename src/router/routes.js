const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout'),
    children: [
      { path: '', component: () => import('pages/Index') },
      {
        path: '/executors',
        component: () => import('layouts/Executor'),
        children: [
          { path: '',
            component: () => import('pages/Executors')
          },
          { path: ':executorId',
            component: () => import('pages/Executor'),
            children: [
              { path: 'taskdefs',
                component: () => import('pages/TaskDefs'),
                children: [
                  { path: ':taskDefId',
                    component: () => import('pages/TaskDef')
                  }
                ]
              }
            ]
          }
        ]
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
