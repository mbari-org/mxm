<template>
  <q-table
    :data="units"
    :columns="columns"
    row-key="unitName"
    :rows-per-page-options="rowsPerPage"
    :pagination.sync="pagination"
    :filter="filter"
    separator="cell"
  >
    <div slot="top-left" slot-scope="props" class="row items-center">
      <div class="col-auto text-h5">
        {{ title }}
      </div>

      <div class="q-ml-md row">
        <q-input
          v-if="units.length"
          class="col"
          color="secondary"
          v-model="filter"
          placeholder="Filter"
          clearable
        />
      </div>
    </div>

    <q-td slot="body-cell-unitName" slot-scope="props" :props="props"
          style="width:5px; vertical-align:top"
    >
      <router-link
        style="text-decoration:none"
        :to="$utl.routeLoc([providerId, 'u', props.row.unitName])"
      >
        {{props.row.unitName}}
      </router-link>
    </q-td>

    <q-td slot="body-cell-abbreviation" slot-scope="props" :props="props"
          style="vertical-align:top"
    >
      {{ props.value }}
    </q-td>

    <q-td slot="body-cell-baseUnit" slot-scope="props" :props="props"
          style="width:5px; vertical-align:top"
    >
      <router-link
        style="text-decoration:none"
        :to="$utl.routeLoc([providerId, 'u', props.row.baseUnit])"
      >
        {{props.row.baseUnit}}
      </router-link>
    </q-td>

  </q-table>
</template>

<script>
  const debug = false

  export default {
    props: {
      providerId: {
        type: String,
        required: true,
      },

      title: {
        type: String,
        default: 'Units',
      },

      units: {
        type: Array,
        required: true,
      },
    },

    data() {
      return {
        columns: [
          {
            field: 'unitName',
            name: 'unitName',
            label: 'Name',
            align: 'left',
            sortable: true
          },
          {
            field: 'abbreviation',
            name: 'abbreviation',
            label: 'abbreviation',
            align: 'left',
            sortable: true
          },
          {
            field: 'baseUnit',
            name: 'baseUnit',
            label: 'Base Units',
            align: 'left',
            sortable: true
          }
        ],
        rowsPerPage: [0],
        pagination: {
          rowsPerPage: 0
        },
        filter: '',
      }
    },
  }
</script>
