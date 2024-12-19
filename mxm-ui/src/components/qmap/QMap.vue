<script setup lang="ts">
import L from 'leaflet'
import * as esri from 'esri-leaflet'
import 'leaflet-mouse-position/src/L.Control.MousePosition'
import 'leaflet.polylinemeasure'
import 'leaflet.polylinemeasure/Leaflet.PolylineMeasure.css'

import { inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { useQMapStore } from './QMapStore'
import QMapButtons from './QMapButtons.vue'
import { useOptsStore } from 'stores/opts'

const debug = window.location.search.match(/.*debug=(-|.*\bqmap\b).*/)

interface Props {
  lmapId: string
  withEditButtons?: boolean
  editable?: boolean
  editing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  withEditButtons: false,
  editable: false,
  editing: false,
})

const googl = inject('googl')

const qmapStore = useQMapStore()

const center = ref({ lat: 36.8, lng: -121.9 } as L.LatLng)
const zoom = ref(10)

const emit = defineEmits<{
  (e: 'startEditing'): void
  (e: 'applyEdits'): void
}>()

function doZoom(out: boolean) {
  if (debug) console.debug('doZoom: out=', out)
  zoom.value += out ? -1 : 1
}

function zoomToAll() {
  console.warn('TODO zoomToAll')
  // TODO
}

function zoomToAllSelected() {
  console.warn('TODO zoomToAllSelected')
  // TODO
}

function _cancelEdits() {
  console.debug('_cancelEdits')
}

onMounted(() => {
  if (debug) console.debug('QMap mounted: lmapId=', props.lmapId)
  const lmap = createMap()
  qmapStore.setLMap(props.lmapId, lmap)

  initBaseLayers(lmap)

  L.control
    .polylineMeasure({
      position: 'topright',
      showUnitControl: true,
      // showClearControl: true,
      // showBearings: true,
      tempLine: {
        color: 'orange',
        weight: 2,
      },
      fixedLine: {
        color: 'blue',
        weight: 2,
      },
    })
    .addTo(lmap)

  initWatch(lmap)

  function createMap(): L.Map {
    // note: in the future, we can use L.PM.setOptIn(true) and pmIgnore=false
    // (see https://github.com/geoman-io/leaflet-geoman/issues/439),
    // when there may be other layers on the map that are not to be edited.
    // L.PM.setOptIn(true)
    const map = L.map(props.lmapId, {
      // pmIgnore: false,
      zoomControl: false,
      // attributionControl: false,
    })

    if (map.getContainer()) {
      L.DomUtil.addClass(map.getContainer(), 'my-default-cursor')
    }

    // helper related with L.control.mousePosition
    const mousePosition = (() => {
      let prefix = '' // with depth if available
      const toFixed = (n: number) => n.toFixed(5)
      const mpos = L.control.mousePosition({
        position: 'topright',
        emptyString: '&nbsp;',
        separator: ', ',
        latFormatter: (v: number) => prefix + toFixed(v),
        lngFormatter: toFixed,
      })

      return {
        addToMap: (map: L.Map) => {
          mpos.addTo(map)
        },

        // TODO call this when depth information is available
        setPrefix: (p: string) => {
          prefix = p
        },
      }
    })()
    mousePosition.addToMap(map)

    return map
  }

  function initBaseLayers(lmap: L.Map) {
    const esriOceansLayer = esri.basemapLayer('Oceans', {
      maxNativeZoom: 13,
      maxZoom: 20,
    })
    const esriOceansLabelsLayer = esri.basemapLayer('OceansLabels', {
      maxNativeZoom: 13,
      maxZoom: 20,
    })
    const esriOceansWithLabelsLayer = L.featureGroup([
      esriOceansLayer,
      esriOceansLabelsLayer,
    ])

    const osmLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    )

    const baseLayers: { [layerName: string]: L.Layer } = {}

    // TODO leaflet or esri bug? if 'ESRI Oceans' is added below (B1)
    //  and 'ESRI Oceans/Labels' is added to the lmap (B2), then the
    //  radio button 'ESRI Oceans' seems to be always pre-selected.
    // Also, a 2nd click on 'ESRI Oceans/Labels' brings the one with only the labels!
    baseLayers['ESRI Oceans/Labels'] = esriOceansWithLabelsLayer
    // baseLayers['ESRI Oceans'] = esriOceansLayer /*(B1)*/
    // TODO in any case, look into using L.esri.Vector.vectorBasemapLayer as suggested by warning on console.

    baseLayers['OpenStreetMap'] = osmLayer

    // if (googleOk) {
    //   baseLayers['Google hybrid'] = L.gridLayer.googleMutant({type: 'hybrid'})
    //   baseLayers['Google satellite'] = L.gridLayer.googleMutant({type: 'satellite'})
    // }

    // as seen in https://ihcantabria.github.io/Leaflet.CanvasLayer.Field/example_ScalarField_Geotiff_WCS.html
    baseLayers['Dark Layer (CARTO)'] = L.tileLayer(
      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
      }
    )

    baseLayers['Empty'] = L.tileLayer('', { opacity: 0 })

    googl.addBaseLayersTo(baseLayers)

    L.control.layers(baseLayers).addTo(lmap)

    const opts = useOptsStore()
    let baseLayerName = opts.baseLayerName
    if (!baseLayerName || !baseLayers[baseLayerName]) {
      baseLayerName = 'ESRI Oceans/Labels'
      opts.setBaseLayerName(baseLayerName)
    }
    baseLayers[baseLayerName].addTo(lmap)
    lmap.on('baselayerchange', ({ name }) => {
      opts.setBaseLayerName(name)
    })
  }

  function initWatch(lmap: L.Map) {
    lmap.setView(center.value, zoom.value)

    lmap.on('moveend', onMapViewChanged)
    lmap.on('zoom', onMapViewChanged)
    lmap.on('resize', onMapViewChanged)

    function onMapViewChanged() {
      if (debug) console.debug('onMapViewChanged', arguments)
      const c = lmap.getCenter()
      center.value = { lat: c.lat, lng: c.lng } as L.LatLng
      zoom.value = lmap.getZoom()
    }

    // with a check to avoid infinite recursion:
    ;(function watchStoreViewToUpdateMapIfDifferent() {
      watch([center, zoom], what => {
        if (debug) console.debug('store view changed: what=', what)
        if (hasViewChangedWrtMap()) {
          if (debug) console.debug('updating lmap per change in view')
          lmap.setView(center.value, zoom.value)
        }
      })

      function hasViewChangedWrtMap() {
        const [mc, mz] = [lmap.getCenter(), lmap.getZoom()]
        return (
          Math.abs(mc.lng - center.value.lng) > 0.000001 ||
          Math.abs(mc.lat - center.value.lat) > 0.000001 ||
          mz !== zoom.value
        )
      }
    })()
  }
})

onUnmounted(() => {
  if (debug) console.debug('QMap unmounted: lmapId=', props.lmapId)
  qmapStore.unsetLMap(props.lmapId)
})
</script>

<template>
  <div :id="lmapId" :data-lmapid="lmapId" class="gjMap fit">
    <QMapButtons
      :withEditButtons="withEditButtons"
      :editable="editable"
      :editing="editing"
      @doZoom="doZoom"
      @zoomToAll="zoomToAll"
      @zoomToAllSelected="zoomToAllSelected"
      @startEditing="emit('startEditing')"
      @applyEdits="emit('applyEdits')"
      @cancelEdits="_cancelEdits"
      v-bind="$attrs"
    />
    <slot />
  </div>
</template>

<style src="leaflet/dist/leaflet.css" />

<style>
.gjMap {
  border: 1px solid black;
  /*overflow: auto;*/
}

.leaflet-container.my-default-cursor {
  cursor: default;
}

.leaflet-control-mouseposition {
  font-family: monospace, serif !important;
  font-size: smaller !important;
  color: black;
  background-color: rgba(255, 255, 255, 0.75) !important;
  padding: 0 4px 0 4px !important;
  border: 1px solid lightgray;
  border-radius: 4px;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

/* PolylineMeasure adjustments: */
a.polyline-measure-controlOnBgColor,
a.polyline-measure-controlOnBgColor:hover {
  /* !important makes it get reflected */
  background-color: #8f8 !important;
}
.polyline-measure-unicode-icon {
  cursor: pointer;
}
</style>
