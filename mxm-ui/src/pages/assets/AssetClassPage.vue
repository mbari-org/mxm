<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUtlStore } from 'stores/utl'
import { useQuery } from '@vue/apollo-composable'

import { ASSET_CLASS } from './queries'
import { computed, ref } from 'vue'
import MxmMarkdown from 'components/utl/markdown/MxmMarkdown.vue'

const debug = window.location.search.match(/.*debug=.*\bassetclass\b.*/)

const route = useRoute()

const params = computed(() => route.params)
const className = computed(() => params.value.className)

const {
  result,
  loading,
  refetch: refetchAssetClass,
} = useQuery(ASSET_CLASS, {
  className,
})

const assetClass = computed(() => result.value?.assetClass ?? {})
const assets = computed(() => assetClass.value?.assets ?? [])

useUtlStore().setRefreshFunction(refetchAssetClass, 'Refresh asset class')

const filter = ref('')

const tableConf = {
  columns: [
    {
      field: 'assetId',
      name: 'assetId',
      label: 'Asset ID',
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
    sortBy: 'assetId',
    descending: false,
    rowsPerPage: 0,
  },
}
</script>

<template>
  <q-page class="q-pa-sm">
    <div v-if="assetClass.className">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-x-sm">
            <div>Asset Class:</div>
            <div class="text-bold">{{ assetClass.className }}</div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <MxmMarkdown :text="assetClass.description" />
        </q-card-section>
      </q-card>
      <q-table
        :rows="assets"
        :columns="tableConf.columns"
        row-key="name"
        :rows-per-page-options="tableConf.rowsPerPage"
        :pagination="tableConf.pagination"
        :filter="filter"
        separator="cell"
        no-data-label="No assets of this class"
      >
        <template v-slot:top>
          <div class="full-width row items-center">
            <div class="col-auto text-h5">Assets</div>

            <div class="q-ml-md row">
              <q-input
                v-if="assets.length"
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
              key="assetId"
              :props="props"
              style="width: 5px; vertical-align: top"
            >
              <router-link
                class="appLink"
                :to="utl.routeLoc(['a', props.row.assetId])"
              >
                {{ props.row.assetId }}
              </router-link>
            </q-td>

            <q-td key="description" :props="props">
              <MxmMarkdown simple hide-empty :text="props.row.description" />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div v-else-if="loading">Loading...</div>
    <div v-else>Asset class not found</div>

    <div v-if="debug">
      <pre>AssetPage: assetClass={{ assetClass }}</pre>
      <pre>AssetPage: assets={{ assets }}</pre>
    </div>
  </q-page>
</template>
