<script setup lang="ts">
import L from 'leaflet'
import { computed } from 'vue'
import { useQMapStore } from 'components/qmap/QMapStore'

interface Props {
  latLngs: L.LatLng[]
  title?: string
  titleTooltip?: string
  editable?: boolean
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  closable: false,
})

const emit = defineEmits<{
  (e: 'closing'): void
  (e: 'coordinateEdited', index: number): void
  (e: 'setCenter', v: L.LatLng): void
}>()

interface Row {
  index: number
  latLng: L.LatLng
}

const tableData = computed(() =>
  props.latLngs.map(
    (latLng, index) =>
      ({
        index,
        latLng,
      } as Row)
  )
)

const qmapStore = useQMapStore()

const tableConf = {
  columns: [
    { name: 'centerCol', field: 'centerCol', label: '', align: 'center' },
    {
      name: 'latitude',
      field: row => row.latLng.lat,
      label: 'Lat',
      align: 'left',
    },
    {
      name: 'longitude',
      field: row => row.latLng.llng,
      label: 'Lon',
      align: 'left',
    },
  ],
  rowsPerPage: [0],
  pagination: {
    rowsPerPage: 0,
  },
}
</script>

<template>
  <div>
    <q-toolbar
      v-if="title || closable"
      class="bg-primary text-white toolbarTitle"
    >
      <q-toolbar-title class="toolbarTitle">
        <div v-if="title">
          {{ title }}
          <q-tooltip v-if="!!titleTooltip">
            {{ titleTooltip }}
          </q-tooltip>
        </div>
      </q-toolbar-title>
      <q-btn
        v-if="closable"
        round
        dense
        flat
        size="sm"
        @click="emit('closing')"
      >
        <q-icon name="cancel" size="14px" />
      </q-btn>
    </q-toolbar>

    <form>
      <div>
        <div>
          <q-table
            dense
            :rows="tableData"
            :columns="tableConf.columns"
            row-key="index"
            :rows-per-page-options="tableConf.rowsPerPage"
            :pagination="tableConf.pagination"
            hide-bottom
          >
            <template v-slot:body="props">
              <q-tr
                :props="props"
                @mouseover="qmapStore.setMousePos(props.row.latLng)"
                @mouseout="qmapStore.setMousePos(null)"
              >
                <q-td
                  key="centerCol"
                  :props="props"
                  style="width: 1px; padding: 0"
                >
                  <q-btn
                    round
                    dense
                    flat
                    size="sm"
                    @click="emit('setCenter', props.row.latLng)"
                  >
                    <q-icon name="album" size="12px" />
                    <q-tooltip :delay="1000">
                      Center map at this position
                    </q-tooltip>
                  </q-btn>
                </q-td>

                <q-td
                  key="latitude"
                  :props="props"
                  style="white-space: nowrap; width: 5px"
                >
                  <div
                    :class="`fieldBg ${editable ? 'bg-green-1' : 'bg-grey-3'}`"
                  >
                    {{ props.row.latLng?.lat?.toFixed(4) ?? '' }}
                    <q-popup-edit
                      v-if="editable"
                      title="latitude"
                      v-model="props.row.latLng.lat"
                      v-slot="scope"
                      @save="() => emit('coordinateEdited', props.row.index)"
                      buttons
                    >
                      <q-input
                        type="number"
                        v-model.number="scope.value"
                        @keyup.enter="scope.set"
                        dense
                        autofocus
                        filled
                      />
                    </q-popup-edit>
                  </div>
                </q-td>

                <q-td
                  key="longitude"
                  :props="props"
                  style="white-space: nowrap; width: 5px; padding-right: 4px"
                >
                  <div
                    :class="`fieldBg ${editable ? 'bg-green-1' : 'bg-grey-3'}`"
                  >
                    {{ props.row.latLng?.lng?.toFixed(4) ?? '' }}
                    <q-popup-edit
                      v-if="editable"
                      title="longitude"
                      v-model="props.row.latLng.lng"
                      v-slot="scope"
                      @save="() => emit('coordinateEdited', props.row.index)"
                      buttons
                    >
                      <q-input
                        type="number"
                        v-model.number="scope.value"
                        @keyup.enter="scope.set"
                        dense
                        autofocus
                        filled
                      />
                    </q-popup-edit>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </div>
    </form>
    <slot />
  </div>
</template>

<style scoped>
.toolbarTitle {
  font-size: 1em;
  height: 20px;
  min-height: unset;
}
</style>
