<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUtlStore } from 'stores/utl'
import { useQuery } from '@vue/apollo-composable'

import { ASSETS } from './queries'
import { computed, ref } from 'vue'
import MxmMarkdownView from 'components/utl/markdown/MxmMarkdownView.vue'

const route = useRoute()

const params = computed(() => route.params)
const providerId = computed(() => params.value.providerId)

const {
  result,
  loading,
  refetch: refetchAssets,
} = useQuery(ASSETS, {
  providerId,
})

const assets = computed(() => result.value?.assetsForProvider ?? [])

useUtlStore().setRefreshFunction(refetchAssets, 'Refresh assets')

const filter = ref('')

const tableConf = {
  columns: [
    {
      field: 'assetId',
      name: 'assetId',
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
    {
      field: 'className',
      name: 'className',
      label: 'Class',
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
  filter: '',
}
</script>

<template>
  <q-page class="q-pa-md">
    <!--
    <pre>params = {{ route.params }}</pre>
    <pre>loading={{ loading }}</pre>
    <pre>AssetsPage: assets={{ assets }}</pre>
-->
    <div v-if="loading">Loading...</div>
    <q-table
      v-else
      :rows="assets"
      :columns="tableConf.columns"
      row-key="name"
      :rows-per-page-options="tableConf.rowsPerPage"
      :pagination="tableConf.pagination"
      :filter="filter"
      separator="cell"
      no-data-label="No assets registered"
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
              :to="utl.routeLoc([props.row.providerId, 'a', props.row.assetId])"
            >
              {{ props.row.assetId }}
            </router-link>
          </q-td>

          <q-td key="description" :props="props">
            <MxmMarkdownView
              simple
              hide-empty
              :text="props.row.description"
              :start-markdown="
                props.row.provider.descriptionFormat === 'markdown'
              "
            />
          </q-td>

          <q-td key="className" :props="props" style="width: 5px">
            <router-link
              class="appLink"
              :to="
                utl.routeLoc([props.row.providerId, 'ac', props.row.className])
              "
            >
              {{ props.row.className }}
            </router-link>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>
