import axios from 'axios'

const debug = false

const state = {
  config: null,
}

const getters = {
  config: state => state.config,
}

const actions = {
  loadConfig({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.config) {
        resolve(state.config)
        return
      }
      const method = 'GET'
      const url = '/statics/config/config.json'
      if (debug) console.log(`${method} ${url}`)
      axios({method, url})
        .then(response => {
          if (debug) console.log(`${method} ${url}: response.data=`, response.data)
          const config = response.data
          commit('setConfig', config)
          resolve(config)
        })
        .catch(e => {
          console.error(e)
          reject(e)
        })
    })
  }
}

const mutations = {
  setConfig (state, c) {
    state.config = c
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
