<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, WatchStopHandle } from 'vue'
import { useQMapStore } from './QMapStore'
import QDrawer from 'components/qmap/QDrawer.vue'
import L from 'leaflet'
import { GeoJSON } from 'geojson'
import qutl from 'components/qmap/qutl'

const debug = window.location.search.match(/.*debug=.*qgeojson.*/)

interface Props {
  geojsonString: string
  geojsonOptions?: L.GeoJSONOptions
  editing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  geojsonOptions: {
    style: {
      color: 'yellow',
      dashArray: '3 9',
    },
  } as L.GeoJSONOptions,
  editing: false,
})

const elm = ref(null as HTMLElement | null)

const layerGroup = L.featureGroup()

let support: Support | null = null

onMounted(() => {
  if (debug) console.debug('QGeoJson mounted: support=', support)
  if (support) {
    return
  }

  if (!elm.value) {
    console.error('QGeoJson mounted: elm.value is null')
    return
  }
  const lmapId = qutl.findContainingLMapId(elm.value)
  if (debug) console.debug(`QMousePosMarker mounted: lmapId=${lmapId}`)

  const lmap = qmapStore.lmap(lmapId)
  if (lmap) {
    support = new Support(lmap)
  } else {
    const stop = watch(
      () => qmapStore.lmap(lmapId),
      lmap => {
        if (lmap) {
          stop()
          support = new Support(lmap)
        }
      }
    )
  }
})

onUnmounted(() => {
  if (debug) console.debug('QGeoJson unmounted')
  if (support) {
    support.destroy()
    support = null
  }
})

const qmapStore = useQMapStore()

class Support {
  lmap: L.Map

  stopWatch: WatchStopHandle

  constructor(lmap: L.Map) {
    this.lmap = lmap
    layerGroup.addTo(this.lmap)
    if (debug)
      console.debug('QGeoJson Support constructor this.lmap', this.lmap)

    const lgeojson = this.createLayer()
    if (lgeojson) {
      layerGroup.addLayer(lgeojson)
    }

    const reflectChanges = () => {
      const lgeojson = this.createLayer()
      if (lgeojson) {
        layerGroup.clearLayers()
        layerGroup.addLayer(lgeojson)
      }
    }

    this.stopWatch = watch(() => props, reflectChanges, {
      deep: true,
    })
  }

  createLayer(): L.GeoJSON | null {
    try {
      const geojson = JSON.parse(props.geojsonString) as GeoJSON
      return L.geoJSON(geojson, props.geojsonOptions)
    } catch (e) {
      console.warn(
        'QGeoJson createLayer error:',
        'geojsonString=',
        props.geojsonString,
        'geojson=',
        props.geojsonString,
        'e=',
        e
      )
      return null
    }
  }

  destroy() {
    this.stopWatch()
    layerGroup.clearLayers()
    this.lmap.removeLayer(layerGroup)
  }
}
</script>

<template>
  <div style="display: none" ref="elm">
    <QDrawer v-if="editing" :layer="layerGroup" v-bind="$attrs" />
  </div>
</template>
