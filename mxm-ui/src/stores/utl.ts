import { defineStore } from 'pinia'

type RefreshFunction = () => void

const noopRefresh = (() => {
  // do nothing
}) as RefreshFunction

interface Breadcrumbs {
  refresh: RefreshFunction
  tooltip?: string
}

interface State {
  breadcrumbs: Breadcrumbs
}

export const useUtlStore = defineStore('utl', {
  state: (): State => ({
    breadcrumbs: {
      refresh: noopRefresh,
    },
  }),

  actions: {
    setRefreshFunction(f: RefreshFunction, tooltip?: string) {
      // console.debug('setRefreshFunction')
      this.breadcrumbs.refresh = f
      this.breadcrumbs.tooltip = tooltip
    },
  },
})
