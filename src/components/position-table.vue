<template>
  <div>
    <q-table
      dense
      :data="tableData"
      :columns="columns"
      row-key="index"
      :rows-per-page-options="rowsPerPage"
      :pagination.sync="pagination"
      hide-bottom
    >
      <!-- TODO how to associate handler to whole row?
           For now, adding mouseover/out to specific columns
      -->
      <q-td slot="body-cell-centerCol" slot-scope="props" :props="props"
            style="width:1px"
            @mouseover.native="onMousePos(props.row)" @mouseout.native="onMousePos()"
      >
        <q-btn
          round dense icon="album"
          size="xs" class="q-mr-xs"
          @click="centerMapAt(props.row)"
        >
          <q-tooltip :delay="2000">
            Center map at this position
          </q-tooltip>
        </q-btn>
      </q-td>

      <q-td slot="body-cell-latitude" slot-scope="props" :props="props"
            style="white-space:nowrap;width:5px"
            @mouseover.native="onMousePos(props.row)" @mouseout.native="onMousePos()"
      >{{ props.value }}
      </q-td>

      <q-td slot="body-cell-longitude" slot-scope="props" :props="props"
            style="white-space:nowrap;width:5px"
            @mouseover.native="onMousePos(props.row)" @mouseout.native="onMousePos()"
      >{{ props.value }}
      </q-td>

    </q-table>

  </div>
</template>

<script>

const debug = true

export default {
  props: {
    latLons: {
      type: [Array, String],
      required: true
    }
  },

  data () {
    return {
      columns: [
        {name: 'centerCol',   field: 'centerCol',   label: '',        align: 'center' },
        {name: 'latitude',    field: row => row.latitude.toFixed(4),  label: 'Lat', align: 'left' },
        {name: 'longitude',   field: row => row.longitude.toFixed(4), label: 'Lon', align: 'left' },
      ],
      rowsPerPage: [0],
      pagination: {
        rowsPerPage: 0
      },
    }
  },

  computed: {
    tableData () {
      let list
      if (typeof(this.latLons) === 'string') {
        try {
          list = JSON.parse(this.latLons)
        }
        catch (error) {
          // TODO
          console.warn(error)
        }
      }
      else {
        list = this.latLons
      }
      return _.map(list, ([latitude, longitude], index) => ({
        index, latitude, longitude,
      }))
    },
  },

  methods: {
    centerMapAt (row) {
      let lat = row && row.latitude
      let lon = row && row.longitude
      if (lat !== undefined && lon !== undefined) {
        this.$root.$emit('evt-map-center-at', lat, lon)
      }
    },

    onMousePos (row) {
      let lat = row && row.latitude
      let lon = row && row.longitude
      this.$root.$emit('evt-map-on-mouse-pos', lat, lon)
    },
  },
}

</script>

<style scoped>
.q-table tbody td {
  font-size: x-small !important;
}
.q-table-dense .q-table th, .q-table-dense .q-table td {
  padding-top: 1px;
  padding-right: 1px;
  padding-bottom: 1px;
  padding-left: 1px;
}
</style>
