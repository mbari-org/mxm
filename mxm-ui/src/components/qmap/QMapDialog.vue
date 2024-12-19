<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import QMap from 'components/qmap/QMap.vue'
import QMousePosMarker from 'components/qmap/QMousePosMarker.vue'
import QGeoJson from 'components/qmap/QGeoJson.vue'
import L from 'leaflet'
import { GeoJSON } from 'geojson'
import { QDialog } from 'quasar'

const debug = window.location.search.match(/.*debug=.*qmapdialog.*/)

interface Props {
  lmapId: string
  geojsonString: string
  geojsonOptions?: L.GeoJSONOptions
  dialogOpened?: boolean
  editable?: boolean
  paramName: string
  position?: string
  widthPx?: number
  headerClass?: string
  footerClass?: string
  submitLabel?: string
  okToSubmit: boolean
  okToDismiss: boolean
}

const props = withDefaults(defineProps<Props>(), {
  geojsonOptions: {
    style: {
      color: 'cyan',
      dashArray: '3 3',
    },
  } as L.GeoJSONOptions,
  dialogOpened: false,
  editable: false,
  position: 'standard',
  widthPx: 700,
  headerClass: 'bg-secondary text-white',
  footerClass: 'bg-secondary text-white',
  submitLabel: 'Apply',
})

const style = computed(() => {
  const widthPx = props.widthPx || 400
  const mapContainerWidth = widthPx - 170
  return {
    card: `width: ${widthPx}px`,
    mapContainer: `width: ${mapContainerWidth}px; height: 500px`,
  }
})

const emit = defineEmits<{
  (e: 'applyEdits', v?: GeoJSON): void
  (e: 'cancelEdits'): void
}>()

const editing = ref(props.editable)

watch(
  () => props.dialogOpened,
  dialogOpened => {
    if (dialogOpened) {
      editing.value = props.editable
    }
  }
)

const qdrawerUpdatedGeoJson = ref(null as GeoJSON | null)

function qDrawerUpdated(geojson: GeoJSON) {
  // console.debug('QMapDialog: qDrawerUpdated', string)
  qdrawerUpdatedGeoJson.value = geojson
}

function applyEdits() {
  if (props.editable) {
    editing.value = false
    nextTick(() => {
      const result = qdrawerUpdatedGeoJson.value
      qdrawerUpdatedGeoJson.value = null
      if (debug) console.debug('emitting applyEdits')
      emit('applyEdits', result)
    })
  }
}

function cancelEdits() {
  editing.value = false
  emit('cancelEdits')
}

// If editable, the following to wait for two quick Escape keystrokes to cancel:
const myDialog = ref(null as QDialog | null)
let prevTimeEscapeKey = 0
function onEscapeKey() {
  const timeEscapeKey = Date.now()
  const doCancel = !props.editable || timeEscapeKey - prevTimeEscapeKey < 500
  prevTimeEscapeKey = timeEscapeKey
  if (doCancel) {
    cancelEdits()
  } else {
    myDialog.value?.shake()
  }
}
</script>

<template>
  <q-dialog
    ref="myDialog"
    :modelValue="dialogOpened"
    :no-backdrop-dismiss="!okToDismiss"
    :no-esc-dismiss="!okToDismiss"
    :position="position"
    @keyup.esc.stop="onEscapeKey"
  >
    <q-card :style="style.card">
      <q-toolbar :class="`${headerClass} toolbarClass`">
        <q-toolbar-title style="font-size: 1.2em">
          {{ editable ? 'Editing' : '' }}
          {{ paramName }}
        </q-toolbar-title>
        <q-btn round dense size="sm" @click="cancelEdits" icon="close" />
      </q-toolbar>

      <q-card-section>
        <div :style="style.mapContainer">
          <QMap
            :lmapId="lmapId"
            :editable="editable"
            :editing="editing"
            @startEditing="editing = true"
            @applyEdits="applyEdits"
            @cancelEdits="cancelEdits"
            v-bind="$attrs"
          >
            <QMousePosMarker />
            <QGeoJson
              :geojsonString="geojsonString"
              :geojsonOptions="geojsonOptions"
              :editing="editing"
              @qDrawerUpdated="qDrawerUpdated"
              v-bind="$attrs"
            />
          </QMap>
        </div>
      </q-card-section>

      <q-toolbar v-if="editing" :class="`${footerClass} toolbarClass`">
        <q-toolbar-title />
        <q-btn
          dense
          no-caps
          :color="okToSubmit ? 'secondary' : 'grey'"
          :label="submitLabel"
          :disable="!okToSubmit"
          @click="applyEdits"
        />
      </q-toolbar>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.toolbarClass {
  font-size: 1em;
  height: 32px;
  min-height: unset;
}
</style>
