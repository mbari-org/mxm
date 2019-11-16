import Vue from 'vue'
import Vuex from 'vuex'

import config from './config'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      config,
    }
  })

  return Store
}

if (process.env.DEV && module.hot) {
  module.hot.accept(['./config'], () => {
    const nw = require('./config').default
    store.hotUpdate({ modules: { config: nw } })
  })
}
