<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  providerId: string
  units: object[]
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Units',
})

const filter = ref('')

const tableConf = {
  columns: [
    {
      field: 'unitName',
      name: 'unitName',
      label: 'Name',
      align: 'left',
      sortable: true,
    },
    {
      field: 'abbreviation',
      name: 'abbreviation',
      label: 'abbreviation',
      align: 'left',
      sortable: true,
    },
    {
      field: 'baseUnit',
      name: 'baseUnit',
      label: 'Base Units',
      align: 'left',
      sortable: true,
    },
  ],
  rowsPerPage: [0],
  pagination: {
    sortBy: 'unitName',
    descending: false,
    rowsPerPage: 0,
  },
}
</script>

<template>
  <q-table
    :rows="units"
    :columns="tableConf.columns"
    row-key="name"
    :rows-per-page-options="tableConf.rowsPerPage"
    :pagination="tableConf.pagination"
    :filter="filter"
    separator="cell"
    no-data-label="No units found"
  >
    <template v-slot:top>
      <div class="full-width row items-center">
        <div class="col-auto text-h5">{{ title }}</div>

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
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="unitName" :props="props" style="width: 5px">
          <router-link
            class="appLink"
            :to="utl.routeLoc([providerId, 'u', props.row.unitName])"
          >
            {{ props.row.unitName }}
          </router-link>
        </q-td>

        <q-td key="abbreviation" :props="props">
          {{ props.row.abbreviation }}
        </q-td>

        <q-td key="baseUnit" :props="props" style="width: 5px">
          <router-link
            class="appLink"
            :to="utl.routeLoc([providerId, 'u', props.row.baseUnit])"
          >
            {{ props.row.baseUnit }}
          </router-link>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
