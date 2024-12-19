<script setup lang="ts">
import { useUtlStore } from 'stores/utl'
import { useQuery } from '@vue/apollo-composable'

import { ALL_ASSET_CLASSES } from './queries'
import { computed, ref } from 'vue'
import MxmMarkdownView from 'components/utl/markdown/MxmMarkdownView.vue'

const {
  result,
  loading,
  refetch: refetchAssetClasses,
} = useQuery(ALL_ASSET_CLASSES)

const assetClasses = computed(() => result.value?.allAssetClasses ?? [])

useUtlStore().setRefreshFunction(refetchAssetClasses, 'Refresh asset classes')

const filter = ref('')

const tableConf = {
  columns: [
    {
      field: 'className',
      name: 'className',
      label: 'Name',
      align: 'left',
      sortable: true,
    },
    {
      field: 'description',
      name: 'description',
      label: 'Description',
      align: 'left',
      sortable: true,
    },
  ],
  rowsPerPage: [0],
  pagination: {
    sortBy: 'className',
    descending: false,
    rowsPerPage: 0,
  },
}
</script>

<template>
  <q-page class="q-pa-sm">
    <!--
        <pre>params = {{ route.params }}</pre>
        <pre>loading={{ loading }}</pre>
        <pre>AssetsPage: assets={{ assets }}</pre>
    -->
    <div v-if="loading">Loading...</div>
    <q-table
      v-else
      :rows="assetClasses"
      :columns="tableConf.columns"
      row-key="name"
      :rows-per-page-options="tableConf.rowsPerPage"
      :pagination="tableConf.pagination"
      :filter="filter"
      separator="cell"
      no-data-label="No asset classes registered"
    >
      <template v-slot:top>
        <div class="full-width row items-center">
          <div class="col-auto text-h5">All registered asset classes</div>

          <div class="q-ml-md row">
            <q-input
              v-if="assetClasses.length"
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
          <q-td
            key="className"
            :props="props"
            style="width: 5px; vertical-align: top"
          >
            <router-link
              class="appLink"
              :to="utl.routeLoc(['ac', props.row.className])"
            >
              {{ props.row.className }}
            </router-link>
          </q-td>

          <q-td key="description" :props="props">
            <MxmMarkdownView simple hide-empty :text="props.row.description" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>
