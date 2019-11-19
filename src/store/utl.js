const state = {
  breadcrumbs: {},
}

const getters = {
}

const actions = {
}

const mutations = {
  setBreadcrumbs (state, v) {
    state.breadcrumbs = v || {}
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
