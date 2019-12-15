import { getApolloClient } from 'boot/apollo'
import allUnitsListGql from '../graphql/units.gql'
import Vue from 'vue'

const debug = window.location.search.match(/.*debug=.*units.*/)

const state = {
  unitsByExecutor: {},
}

const getters = {
}

const actions = {
  getOrLoadUnitsForExecutor({ state, dispatch }, executorId) {
    return new Promise((resolve, reject) => {
      const units = state.unitsByExecutor[executorId]
      if (units)
        resolve(units)
      else
        return dispatch('loadUnitsForExecutor', executorId)
    })
  },

  loadUnitsForExecutor({ commit, state, dispatch }, executorId) {
    return new Promise((resolve, reject) => {
      getApolloClient()
        .then(apolloClient => {
          if (debug) console.log(`loadUnitsForExecutor: executorId=${executorId}`)
          apolloClient.query({
            query: allUnitsListGql,
            variables: {
              executorId,
            },
          })
            .then(res => {
              const units = res.data.allUnitsList
              if (debug) console.log('UNITS=', units)
              commit('setUnitsForExecutor', {executorId, units})
              resolve(units)
            })
            .catch(reject)
        })
    })
  },
}

const mutations = {
  setUnitsForExecutor(state, {executorId, units}) {
    if (debug) console.log(`setUnitsForExecutor ${executorId}:`, units)
    if (units) {
      Vue.set(state.unitsByExecutor, executorId, units)
    }
    else {
      Vue.delete(state.unitsByExecutor, executorId)
    }
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
