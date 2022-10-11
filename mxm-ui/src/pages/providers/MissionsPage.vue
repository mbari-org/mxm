<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUtlStore } from 'stores/utl'
import { useQuery } from '@vue/apollo-composable'

import MxmMarkdownView from 'components/utl/markdown/MxmMarkdownView.vue'
import MissionNewButton from './MissionNewButton.vue'

import { PROVIDER_MISSIONS } from './queries'
import { computed, ref, watch } from 'vue'

const route = useRoute()

const params = computed(() => route.params)
const providerId = computed(() => params.value.providerId)

const {
  result,
  loading,
  refetch: refetchMissions,
} = useQuery(PROVIDER_MISSIONS, {
  providerId,
})

const provider = computed(() => result.value?.provider ?? {})

const missions = computed(() => provider.value?.missions ?? [])

watch(params, () => {
  refetchMissions()
})

useUtlStore().setRefreshFunction(refetchMissions, 'Refresh missions')

const filter = ref('')

const tableConf = {
  columns: [
    {
      field: 'updatedDate',
      name: 'updatedDate',
      label: 'Updated',
      align: 'left',
      sortable: true,
    },
    {
      field: 'missionStatus',
      name: 'missionStatus',
      label: 'Status',
      align: 'left',
      sortable: true,
    },
    {
      field: 'missionTplId',
      name: 'missionTplId',
      label: 'Mission',
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
      field: 'assetId',
      name: 'assetId',
      label: 'Asset',
      align: 'left',
      sortable: true,
    },
    {
      field: 'missionId',
      name: 'missionId',
      label: 'ID',
      align: 'left',
      sortable: true,
    },
    {
      field: 'providerMissionId',
      name: 'providerMissionId',
      label: 'PMID',
      align: 'left',
      sortable: true,
    },
  ],
  rowsPerPage: [0],
  pagination: {
    sortBy: 'updatedDate',
    descending: true,
    rowsPerPage: 0,
  },
}
</script>

<template>
  <q-page class="q-pa-md">
    <!--
        <pre>params = {{ route.params }}</pre>
        <pre>loading={{ loading }}</pre>
        <pre>MissionsPage: provider={{ provider }}</pre>
    -->
    <q-table
      v-if="provider"
      :rows="missions"
      :columns="tableConf.columns"
      row-key="name"
      :rows-per-page-options="tableConf.rowsPerPage"
      :pagination="tableConf.pagination"
      :filter="filter"
      separator="cell"
      no-data-label="No missions defined or currently exposed by this provider"
    >
      <template v-slot:top>
        <div class="full-width row items-center">
          <div class="col-auto text-h5">Missions</div>

          <div class="q-ml-md row">
            <q-input
              v-if="missions.length"
              class="col"
              color="secondary"
              v-model="filter"
              placeholder="Filter"
              clearable
            />
          </div>

          <MissionNewButton
            v-if="provider.missionTemplates"
            :providerId="providerId"
            :missionTpls="provider.missionTemplates"
          />
        </div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td
            key="updatedDate"
            :props="props"
            style="width: 5px; vertical-align: top"
          >
            {{ props.row.updatedDate }}
          </q-td>

          <q-td
            key="missionStatus"
            :props="props"
            style="width: 5px; vertical-align: top"
          >
            <q-chip dense size="sm">{{ props.row.missionStatus }}</q-chip>
          </q-td>

          <q-td
            key="missionTplId"
            :props="props"
            style="width: 5px; vertical-align: top"
          >
            <router-link
              class="appLink"
              :to="
                utl.routeLoc([
                  'p',
                  params.providerId,
                  'mt',
                  props.row.missionTplId,
                  'm',
                  props.row.missionId,
                ])
              "
            >
              {{ props.row.missionTplId }}
            </router-link>
          </q-td>

          <q-td key="description" :props="props">
            <MxmMarkdownView
              simple
              hide-empty
              :text="props.row.description"
              :start-markdown="provider.descriptionFormat === 'markdown'"
            />
          </q-td>

          <q-td
            key="assetId"
            :props="props"
            style="width: 5px; vertical-align: top"
          >
            <router-link
              class="appLink"
              :to="
                utl.routeLoc(['p', params.providerId, 'a', props.row.assetId])
              "
            >
              {{ props.row.assetId }}
            </router-link>
          </q-td>

          <q-td
            key="missionId"
            :props="props"
            style="width: 5px; vertical-align: top"
          >
            <router-link
              class="appLink"
              :to="
                utl.routeLoc([
                  'p',
                  params.providerId,
                  'mt',
                  props.row.missionTplId,
                  'm',
                  props.row.missionId,
                ])
              "
            >
              {{ props.row.missionId }}
            </router-link>
          </q-td>

          <q-td
            key="providerMissionId"
            :props="props"
            style="width: 5px; vertical-align: top"
          >
            <div v-if="props.row.providerMissionId">
              {{ props.row.providerMissionId }}
              <q-tooltip>Provider mission ID</q-tooltip>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <div v-else-if="loading">Loading...</div>
    <div v-else>Hmm, no provider found</div>
  </q-page>
</template>
