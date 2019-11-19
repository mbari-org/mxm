import Vue from 'vue'
import Vuex from 'vuex'

import utl from './utl'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      utl,
    }
  })

  return Store
}


if (process.env.DEV && module.hot) {
  module.hot.accept(['./utl'], () => {
    const nw = require('./utl').default
    store.hotUpdate({ modules: { utl: nw } })
  })
}
