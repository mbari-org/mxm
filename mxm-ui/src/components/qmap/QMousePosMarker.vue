<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, WatchStopHandle } from 'vue'
import { QMousePos, useQMapStore } from './QMapStore'
import qutl from 'components/qmap/qutl'
import L from 'leaflet'

const debug = window.location.search.match(/.*debug=(-|.*\bmousepos\b).*/)

const elm = ref(null as HTMLElement | null)

let support: Support | null = null

onMounted(() => {
  if (support) {
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
  // console.debug('QMousePosMarker unmounted')
  if (support) {
    support.destroy()
    support = null
  }
})

const qmapStore = useQMapStore()

class Support {
  lmap: L.Map
  layerGroup: L.LayerGroup
  stopWatch: WatchStopHandle

  constructor(lmap: L.Map) {
    this.lmap = lmap

    // arbitrary initial position and radius
    const mp = [36.5, -122.3] as L.LatLngTuple
    const radius = 5
    const marker1 = L.circleMarker(mp, {
      color: 'yellow',
      dashArray: '5 4',
      radius,
    })
    const marker2 = L.circleMarker(mp, {
      color: 'red',
      dashArray: '5 4',
      radius: radius * 3,
    })

    this.layerGroup = L.layerGroup([marker1, marker2])

    let inMap = false

    this.stopWatch = watch(qmapStore.mousePos, (mousePos: QMousePos) => {
      if (mousePos.position) {
        if (!inMap) {
          this.layerGroup.addTo(this.lmap)
          inMap = true
        }
        marker1.setLatLng(mousePos.position)
        marker2.setLatLng(mousePos.position)
        const radius = mousePos.radius
        marker1.setRadius(radius)
        marker2.setRadius(radius * 3)
      } else {
        this.lmap.removeLayer(this.layerGroup)
        inMap = false
      }
    })
  }

  destroy() {
    this.stopWatch()
    qmapStore.setMousePos(null)
    this.lmap.removeLayer(this.layerGroup)
  }
}
</script>

<template>
  <div style="display: none" ref="elm"></div>
</template>
