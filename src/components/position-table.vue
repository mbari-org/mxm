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
      <q-tr slot="body" slot-scope="props" :props="props"
            @mouseover.native="onMousePos(props.row)" @mouseout.native="onMousePos()"
      >
        <q-td key="centerCol" :props="props"
              style="width:1px"
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

        <q-td key="latitude" :props="props"
              style="white-space:nowrap;width:5px"
        >{{ props.row.latitude.toFixed(4) }}
        </q-td>

        <q-td key="longitude" :props="props"
              style="white-space:nowrap;width:5px"
        >{{ props.row.longitude.toFixed(4) }}
        </q-td>
      </q-tr>

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
        {name: 'latitude',    field: 'latitude',    label: 'Lat',     align: 'left' },
        {name: 'longitude',   field: 'longitude',   label: 'Lon',     align: 'left' },
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
      const lat = row && row.latitude
      const lon = row && row.longitude
      if (lat !== undefined && lon !== undefined) {
        this.$root.$emit('evt-map-center-at', [lat, lon])
      }
    },

    onMousePos (row) {
      const lat = row && row.latitude
      const lon = row && row.longitude
      const latLon = lat !== undefined && lon !== undefined ? [lat, lon] : null
      this.$root.$emit('evt-map-on-mouse-pos', latLon)
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
