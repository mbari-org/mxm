import { getApolloClient } from 'boot/apollo'
import allUnitsListGql from '../graphql/units.gql'
import Vue from 'vue'

const debug = window.location.search.match(/.*debug=.*units.*/)

const state = {
  unitsByProvider: {},
}

const getters = {
}

const actions = {
  getOrLoadUnitsForProvider({ state, dispatch }, providerId) {
    return new Promise((resolve, reject) => {
      const units = state.unitsByProvider[providerId]
      if (units)
        resolve(units)
      else
        return dispatch('loadUnitsForProvider', providerId)
    })
  },

  loadUnitsForProvider({ commit, state, dispatch }, providerId) {
    return new Promise((resolve, reject) => {
      getApolloClient()
        .then(apolloClient => {
          if (debug) console.log(`loadUnitsForProvider: providerId=${providerId}`)
          apolloClient.query({
            query: allUnitsListGql,
            variables: {
              providerId,
            },
          })
            .then(res => {
              const units = res.data.allUnitsList
              if (debug) console.log('UNITS=', units)
              commit('setUnitsForProvider', {providerId, units})
              resolve(units)
            })
            .catch(reject)
        })
    })
  },
}

const mutations = {
  setUnitsForProvider(state, {providerId, units}) {
    if (debug) console.log(`setUnitsForProvider ${providerId}:`, units)
    if (units) {
      Vue.set(state.unitsByProvider, providerId, units)
    }
    else {
      Vue.delete(state.unitsByProvider, providerId)
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
