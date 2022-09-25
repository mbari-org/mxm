import { defineStore } from 'pinia'

interface Opts {
  darkMode: string
  baseLayerName: string
}

export const useOptsStore = defineStore('opts', {
  state: (): Opts => ({
    darkMode: 'auto',
    baseLayerName: '',
  }),

  actions: {
    setDarkMode(darkMode: string) {
      this.darkMode = darkMode
    },

    setBaseLayerName(baseLayerName: string) {
      this.baseLayerName = baseLayerName
    },
  },
  persist: true,
})
