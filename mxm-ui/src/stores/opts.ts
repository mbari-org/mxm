import { defineStore } from 'pinia'

export type DarkMode = 'auto' | boolean

interface Opts {
  darkMode: DarkMode
  darkModeIsActive: boolean // TODO put in excludedPaths when available
  // https://github.com/prazdevs/pinia-plugin-persistedstate/issues/109

  baseLayerName: string
}

export const useOptsStore = defineStore('opts', {
  state: (): Opts => ({
    darkMode: 'auto',
    darkModeIsActive: false,
    baseLayerName: '',
  }),

  actions: {
    setDarkMode(darkMode: DarkMode) {
      this.darkMode = darkMode
    },

    setDarkModeIsActive(darkModeIsActive: boolean) {
      this.darkModeIsActive = darkModeIsActive
    },

    setBaseLayerName(baseLayerName: string) {
      this.baseLayerName = baseLayerName
    },
  },
  persist: true,
})
