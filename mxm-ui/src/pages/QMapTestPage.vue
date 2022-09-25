<script setup lang="ts">
import QMap from 'components/qmap/QMap.vue'
import QMousePosMarker from 'components/qmap/QMousePosMarker.vue'
import QGeoJson from 'components/qmap/QGeoJson.vue'
import QCoordsTable from 'components/qmap/QCoordsTable.vue'
import ParameterValue from 'components/paramInput/ParameterValue.vue'
import { useQMapStore } from 'components/qmap/QMapStore'

import { nextTick, ref } from 'vue'
import L from 'leaflet'
import { GeoJSON, GeoJsonObject } from 'geojson'

const LMAP_ID = 'testPage'

const qmapStore = useQMapStore()

const latLngs = ref([
  L.latLng(36.7, -121.9),
  L.latLng(36.7, -122),
  L.latLng(36.8, -122),
  L.latLng(36.8, -121.9),
])

function coordinateEdited(index: number) {
  nextTick(() => {
    console.debug(`coordinateEdited: index=${index}`, latLngs.value[index])
  })
}

const includeMousePosMarker = ref(true)

const numberParam = ref('42')
const boolParam = ref('false')

const geojsonParamOriginal = `{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [
          -122.04,
          36.85
        ],
        [
          -121.843,
          36.85
        ],
        [
          -121.843,
          36.7
        ],
        [
          -122.04,
          36.734
        ]
      ]
    ]
  }
}`

const geojsonStringParam = ref(geojsonParamOriginal)
const geojsonOptions = ref({
  style: {
    color: 'red',
  },
})

const geojsonEditable = ref(true)
const geojsonEditing = ref(false)

const saveGeojsonStringParam = ref(geojsonStringParam)

let endEditingResult: GeoJsonObject | null = null

function endEditing(geojson: GeoJsonObject) {
  console.debug('endEditing: geojson=', JSON.stringify(geojson, null, ' '))
  endEditingResult = geojson
}

function startEditing() {
  if (!geojsonEditing.value) {
    saveGeojsonStringParam.value = geojsonStringParam.value
    geojsonEditing.value = true
    endEditingResult = null
  }
}

function qDrawerUpdated(geojson: GeoJSON) {
  const string = JSON.stringify(geojson, null, ' ')
  // console.debug('QMapTestPage: qDrawerUpdated', string)
  endEditingResult = geojson
}

function applyEdits() {
  if (geojsonEditing.value) {
    geojsonEditing.value = false
    nextTick(() => {
      geojsonStringParam.value = JSON.stringify(endEditingResult, null, ' ')
      endEditingResult = null
    })
  }
}

function cancelEdits() {
  if (geojsonEditing.value) {
    geojsonStringParam.value = saveGeojsonStringParam.value
    geojsonEditing.value = false
    endEditingResult = null
  }
}

const includeGeoJsonLayer = ref(true)
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-x-md no-wrap">
      <div class="column">
        <div class="row q-gutter-x-md">
          <q-btn
            label="Toggle editable"
            no-caps
            small
            @click="geojsonEditable = !geojsonEditable"
          />
          <q-checkbox
            label="mousePosMarker"
            no-caps
            dense
            small
            v-model="includeMousePosMarker"
          />
          <q-checkbox
            label="includeGeoJsonLayer"
            no-caps
            dense
            small
            v-model="includeGeoJsonLayer"
          />
        </div>

        <div style="width: 700px; height: 500px">
          <QMap
            :lmapId="LMAP_ID"
            withEditButtons
            :editable="geojsonEditable"
            :editing="geojsonEditing"
            @startEditing="startEditing"
            @applyEdits="applyEdits"
            @cancelEdits="cancelEdits"
          >
            <QMousePosMarker v-if="includeMousePosMarker" />
            <QGeoJson
              v-if="includeGeoJsonLayer"
              :geojsonString="geojsonStringParam"
              :geojsonOptions="geojsonOptions"
              :editing="geojsonEditing"
              @qDrawerUpdated="qDrawerUpdated"
            />
          </QMap>
        </div>
      </div>

      <div class="column">
        <QCoordsTable
          style="width: 200px; height: 200px"
          :latLngs="latLngs"
          title="latLngs"
          titleTooltip="test test"
          __editable
          @setCenter="ll => qmapStore.lmap(LMAP_ID).setView(ll)"
          @coordinateEdited="coordinateEdited"
        />
        <q-dialog :model-value="false" position="left" seamless>
          <q-scroll-area
            style="height: 400px; width: 200px"
            class="bg-grey-1 shadow-7"
          >
            <pre style="font-size: 0.8em" class="q-pa-md">{{ latLngs }}</pre>
          </q-scroll-area>
        </q-dialog>

        <div class="fieldBg column q-gutter-y-md q-pa-sm">
          <ParameterValue
            label="some number:"
            paramName="Number"
            :paramValue="numberParam"
            defaultValue="42"
            paramType="number"
            paramRequired
            editable
            @valueInput="v => (numberParam = v)"
            class="shadow-3"
          />

          <ParameterValue
            label="Some boolean:"
            paramName="Boolean"
            :paramValue="boolParam"
            defaultValue="false"
            paramType="boolean"
            paramRequired
            editable
            @valueInput="v => (boolParam = v)"
            class="shadow-3"
          />

          <ParameterValue
            label="Some geojson:"
            paramName="GeoJson"
            :paramValue="geojsonStringParam"
            :defaultValue="geojsonParamOriginal"
            paramType="GeoJSON"
            paramRequired
            editable
            @valueInput="v => (geojsonStringParam = v)"
            class="shadow-3"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>
