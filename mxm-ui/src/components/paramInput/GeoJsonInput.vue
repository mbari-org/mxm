<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import L from 'leaflet'
import QMapDialog from 'components/qmap/QMapDialog.vue'
import { GeoJSON } from 'geojson'

const debug = window.location.search.match(/.*debug=(-|.*\bgeojson\b).*/)

interface Props {
  label?: string
  paramName: string
  paramValue: string
  paramType: string
  paramRequired?: boolean
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  paramRequired: false,
  editable: false,
})

// Note: a fixed ID as at most one dialog should be open at a time
const LMAP_ID = 'geojsonInputQmapDialog'

const mxmVal = inject('mxmVal')

const geoJsonValue = computed(() => {
  const geojson: GeoJSON = mxmVal.toGeojson(props.paramValue, props.paramType)
  return JSON.stringify(geojson, null, '  ')
})

const paramValueModel = ref(geoJsonValue.value)

const emit = defineEmits(['valueInput', 'valueError'])

function string2GeoJSON(str: string): GeoJSON | string {
  try {
    const json = JSON.parse(str)
    L.geoJSON(json)
    return json
  } catch (e) {
    return e.message
  }
}

const computedGeoJSON = computed((): GeoJSON | string =>
  string2GeoJSON(paramValueModel.value)
)

const errorMsg = computed((): string | null => {
  const geojson = computedGeoJSON.value
  return typeof geojson === 'string' ? geojson : null
})

function valueInput(value: string) {
  const g = string2GeoJSON(value)
  if (typeof g === 'string') {
    emit('valueError', g)
    return
  }

  const valueString = mxmVal.fromGeojson(g, props.paramType)
  if (debug)
    console.debug(
      'GeoJsonInput: valueInput:',
      'paramType=',
      props.paramType,
      'emitting=',
      valueString
    )
  emit('valueInput', valueString)
}

const inputProps = computed(() => {
  let style = 'width:30em'
  let rows = 8
  return { rows, style }
})

const geojsonOptions = ref({
  style: {
    color: 'red',
  },
})

const qmapDialogOpen = ref(false)

function applyEdits(geojson: GeoJSON) {
  const string = JSON.stringify(geojson, null, ' ')
  if (debug) console.debug('GeoJsonInput: applyEdits', string)
  paramValueModel.value = string
  qmapDialogOpen.value = false
  valueInput(string)
}

function cancelEdits() {
  if (debug) console.debug('GeoJsonInput: cancelEdits')
  qmapDialogOpen.value = false
}
</script>

<template>
  <div class="column">
    <div class="row items-center justify-between">
      <div v-if="label">{{ label }}</div>
      <div>
        <q-btn
          size="sm"
          color="secondary"
          round
          dense
          icon="place"
          no-caps
          @click="qmapDialogOpen = true"
        />
        <QMapDialog
          :lmapId="LMAP_ID"
          :paramName="paramName"
          :geojsonString="paramValueModel"
          :geojsonOptions="geojsonOptions"
          :dialogOpened="qmapDialogOpen"
          :editable="editable"
          okToDismiss
          okToSubmit
          @applyEdits="applyEdits"
          @cancelEdits="cancelEdits"
        />
      </div>
    </div>
    <q-input
      type="textarea"
      :rows="inputProps.rows"
      :readonly="!editable"
      autofocus
      dense
      v-model="paramValueModel"
      @update:model-value="valueInput"
      :error="!!errorMsg"
      :error-message="errorMsg"
      :style="inputProps.style"
      class="inputClass fieldBg q-px-xs rounded-borders"
    />
  </div>
</template>

<style scoped>
.inputClass {
  font-family: monospace;
  font-size: smaller;
}
</style>
