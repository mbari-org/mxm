import { loadConfig } from 'boot/mxmConfig'
import { boot } from 'quasar/wrappers'
import L from 'leaflet'
import 'leaflet.gridlayer.googlemutant/Leaflet.GoogleMutant'

const debug = window.location.search.match(/.*debug=.*\bgoogl\b.*/)

interface Googl {
  addBaseLayersTo: (layerMap: { [layerName: string]: L.Layer }) => void
}

const googl: Googl = {
  addBaseLayersTo,
}

declare module 'vue' {
  interface ComponentCustomProperties {
    googl: Googl
  }
}

export default boot(async ({ app }) => {
  const config = await loadConfig
  app.provide('googl', googl)
  if (debug) console.debug('googl: googleApiKey=', config.googleApiKey)
  if (config.googleApiKey) {
    setupGoogleApi(config.googleApiKey)
  }
})

let googleApiAvailable = false

const baseLayerMap: Map<string, L.Layer> = new Map()

function addBaseLayersTo(layerMap: { [layerName: string]: L.Layer }) {
  baseLayerMap.forEach((layer, layerName) => {
    layerMap[layerName] = layer
  })
}

function setupGoogleApi(googleApiKey: string) {
  if (debug) console.debug('setupGoogleApi: googleApiKey=', googleApiKey)
  if (googleApiKey) {
    const url = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}`
    const script = document.createElement('script')
    script.setAttribute('src', url)
    document.head.appendChild(script)

    baseLayerMap.set(
      'Google hybrid',
      L.gridLayer.googleMutant({ type: 'hybrid' })
    )
    baseLayerMap.set(
      'Google satellite',
      L.gridLayer.googleMutant({ type: 'satellite' })
    )

    if (debug) console.debug('google api set up.')
    googleApiAvailable = true
  }
}
