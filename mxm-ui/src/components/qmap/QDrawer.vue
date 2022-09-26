<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useQMapStore } from './QMapStore'
import L from 'leaflet'
import { GeoJsonObject } from 'geojson'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import qutl from 'components/qmap/qutl'

const debug = window.location.search.match(/.*debug=.*qdraw.*/)

interface Props {
  layer: L.Layer
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  (e: 'qDrawerUpdated', v?: GeoJsonObject): void
}>()

const elm = ref(null as HTMLElement | null)

let support: Support | null = null

const qmapStore = useQMapStore()

onMounted(() => {
  const lmapId = qutl.findContainingLMapId(elm.value)
  if (debug)
    console.debug(`QDrawer onMounted: lmapId=${lmapId}`, 'layer=', props.layer)

  if (support) {
    console.warn('QDrawer onMounted: unexpected:  support already exists')
    return
  }

  const createSupport = (lmap: L.Map) =>
    nextTick(() => {
      support = new Support(lmap, props.layer)
    })

  const lmap = qmapStore.lmap(lmapId)
  if (lmap) {
    createSupport(lmap)
  } else {
    const stop = watch(
      () => qmapStore.lmap(lmapId),
      lmap => {
        if (lmap) {
          stop()
          createSupport(lmap)
        }
      }
    )
  }
})

onBeforeUnmount(() => {
  if (debug) console.debug('QDrawer onBeforeUnmount')
  if (support) {
    support.destroy()
    support = null
  }
})

class Support {
  lmap: L.Map
  givenLayer: L.Layer
  drawFeatureGroup: L.FeatureGroup = L.featureGroup()
  anyChanges = false

  constructor(lmap: L.Map, givenLayer: L.Layer) {
    this.lmap = lmap
    this.givenLayer = givenLayer

    console.assert(lmap.pm)

    lmap.pm.setGlobalOptions({
      layerGroup: this.drawFeatureGroup,
      allowSelfIntersection: false,
      removeLayerBelowMinVertexCount: false,
    })

    // js is weird
    this.emitQDrawerEditsHappening = this.emitQDrawerEditsHappening.bind(this)
    this.pmEventHandlerOnMap = this.pmEventHandlerOnMap.bind(this)
    this.pmEventHandlerOnLayer = this.pmEventHandlerOnLayer.bind(this)

    this.startEditing()
    if (debug)
      console.debug(
        'QDrawer Support created:',
        `with ${this.drawFeatureGroup.getLayers().length} layers`,
        'drawFeatureGroup=',
        this.drawFeatureGroup
      )
  }

  startEditing() {
    if (debug) console.debug('startEditing')

    this.drawFeatureGroup.addTo(this.lmap)

    this.lmap.pm.addControls({
      position: 'topleft',

      drawPolygon: true,
      drawRectangle: true,
      drawCircle: true,
      drawCircleMarker: true,
      drawMarker: false,
      drawPolyline: true,
      drawText: false,
      cutPolygon: false,

      editMode: true,
      dragMode: true,
      editPolygon: true,
      dragPolygon: true,
      deleteLayer: true,
      removalMode: false, // seems to not matter when deleteLayer=true
    })

    this.lmap.on('pm:create pm:edit', this.pmEventHandlerOnMap)

    this.addNonGroupLayers(this.givenLayer)
    if (debug)
      console.debug(
        'ADDED layers=',
        JSON.stringify(this.drawFeatureGroup.toGeoJSON(), null, 2)
      )

    this.emitQDrawerEditsHappening()
  }

  emitQDrawerEditsHappening() {
    this.anyChanges = true
    const geojson = this.getResultingGeoJson()
    if (debug)
      console.debug('emitting qDrawerUpdated', JSON.stringify(geojson, null, 2))
    emit('qDrawerUpdated', geojson)
  }

  pmEventHandlerOnMap(e: L.LeafletEvent) {
    if (debug) console.debug(`ON MAP type=${e.type}`, e)

    if (e.type === 'pm:create' && e.layer) {
      e.layer.on('pm:edit', this.pmEventHandlerOnLayer)
    }

    this.emitQDrawerEditsHappening()
  }

  pmEventHandlerOnLayer(e: L.LeafletEvent) {
    if (debug) console.debug(`ON LAYER type=${e.type}`, e)
    this.emitQDrawerEditsHappening()
  }

  addNonGroupLayers(layer: L.Layer, level = 0) {
    layer.on('pm:edit', this.pmEventHandlerOnLayer)
    layer.on('pm:remove', e => {
      const id = this.drawFeatureGroup.getLayerId(e.layer)
      if (debug) console.debug('pm:remove', e, 'ID=', id)
      e.layer.remove()
      this.emitQDrawerEditsHappening()
    })
    this.drawFeatureGroup.addLayer(layer)
    if (debug)
      console.debug(
        `(${level}) ADDED layer with id=`,
        this.drawFeatureGroup.getLayerId(layer),
        JSON.stringify(layer.toGeoJSON(), null, 2)
      )

    if (layer instanceof L.LayerGroup) {
      layer.eachLayer(child => {
        if (debug)
          console.debug(
            `(${level}) ADDED child with id=`,
            layer.getLayerId(child)
          )
        this.addNonGroupLayers(child, level + 1)
      })
    }
  }

  getResultingGeoJson(): GeoJsonObject {
    const fg = this.lmap.pm.getGeomanLayers(true)
    return fg.toGeoJSON()
  }

  destroy() {
    if (debug) console.debug('destroy')
    this.lmap.off('pm:create pm:edit', this.pmEventHandlerOnMap)
    this.drawFeatureGroup.clearLayers()
    this.lmap.removeLayer(this.drawFeatureGroup)
    this.lmap.pm.removeControls()
  }
}
</script>

<template>
  <div style="display: none" ref="elm"></div>
</template>
