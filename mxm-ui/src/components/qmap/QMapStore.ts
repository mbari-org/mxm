import { defineStore } from 'pinia'
import L from 'leaflet'
import { computed, markRaw, ref } from 'vue'

const debug = window.location.search.match(/.*debug=(-|.*\bqmap\b).*/)

export interface QMousePos {
  position: L.LatLng | null
  radius: number
}

const lmaps = ref({} as { [lmapId: string]: L.Map })

export const useQMapStore = defineStore('qmap', () => {
  const lmap = computed(
    (): ((lmapId: string) => L.Map) => lmapId => lmaps.value[lmapId]
  )

  function setLMap(lmapId: string, lmap: L.Map) {
    if (debug) console.debug('setLMap: lmap=', lmap)
    lmaps.value[lmapId] = markRaw(lmap)
  }

  function unsetLMap(lmapId: string) {
    if (debug) console.debug('unsetLMap: lmapId=', lmapId)
    delete lmaps.value[lmapId]
  }

  const mousePos = ref({
    position: null,
    radius: 10,
  } as QMousePos)

  function setMousePos(ll: L.LatLng | null) {
    // console.debug('setMousePos: ll=', ll)
    mousePos.value.position = ll
  }

  return {
    setLMap,
    lmap,
    unsetLMap,

    mousePos,
    setMousePos,
  }
})
