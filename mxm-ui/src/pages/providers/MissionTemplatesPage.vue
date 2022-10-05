<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUtlStore } from 'stores/utl'
import { useMutation, useQuery } from '@vue/apollo-composable'
import MxmMarkdownView from 'components/utl/markdown/MxmMarkdownView.vue'

import ElapsedTime from 'components/utl/ElapsedTime.vue'

import {
  MISSION_TEMPLATE_BASIC,
  MISSION_TEMPLATES_DIRECTORY,
  UPDATE_MISSION_TEMPLATE,
} from './queries'
import { computed, inject } from 'vue'
import { useQuasar } from 'quasar'

const debug = window.location.search.match(/.*debug=(-|.*\bmissiontpl\b).*/)

const route = useRoute()

const params = computed(() => route.params)
const providerId = computed(() => params.value.providerId)
const missionTplId = computed(() => params.value.missionTplId || '/')

const {
  result: resultBasic,
  loading: loadingBasic,
  refetch: refetchBasic,
} = useQuery(MISSION_TEMPLATE_BASIC, {
  providerId,
  missionTplId,
})

const missionTplBasic = computed(() => resultBasic.value?.missionTemplate ?? {})

const {
  result,
  loading: loadingDirectory,
  refetch: refetchDirectory,
} = useQuery(MISSION_TEMPLATES_DIRECTORY, {
  providerId,
  directory: missionTplId,
})

const templates = computed(() => result.value?.listMissionTplsDirectory ?? [])

const { mutate: updateMissionTemplate } = useMutation(UPDATE_MISSION_TEMPLATE)

const loading = computed(() => loadingBasic.value || loadingDirectory.value)

const utl = inject('utl')

const $q = useQuasar()

async function updateMissionTplBasic() {
  const variables = {
    pl: {
      providerId: providerId.value,
      missionTplId: missionTplId.value,
    },
  }
  try {
    const data = await updateMissionTemplate(variables)
    if (debug) console.debug('updateMissionTemplate: mutation data=', data)
    $q.notify({
      message: 'Mission template directory updated',
      timeout: 1000,
      position: 'top',
      color: 'info',
    })
  } catch (error) {
    utl.exceptionHelper($q, error)
  }
}

async function refreshMissionTpls() {
  refetchBasic()
}

async function reloadMissionTpls() {
  if (debug) console.debug('reloadMissionTpls')
  $q.loading.show({
    message: `Reloading template directory ${missionTplId.value} ...`,
    messageColor: 'black',
    customClass: 'text-bold',
  })
  try {
    // TODO get updated info from the mutation itself
    await updateMissionTplBasic()
    await refreshMissionTpls()
  } finally {
    $q.loading.hide()
  }
}

useUtlStore().setRefreshFunction(
  reloadMissionTpls,
  'Reload mission template directory'
)

const tableConf = {
  columns: [
    {
      field: 'missionTplId',
      name: 'missionTplId',
      label: 'ID',
      align: 'left',
      sortable: true,
    },
    {
      name: 'description',
      field: 'description',
      label: 'Description',
      align: 'left',
      sortable: true,
    },
  ],
  rowsPerPage: [0],
  pagination: {
    sortBy: 'missionTplId',
    descending: false,
    rowsPerPage: 0,
  },
}
</script>

<template>
  <q-page>
    <div v-if="loading">Loading...</div>
    <q-table
      v-else
      :rows="templates"
      :columns="tableConf.columns"
      row-key="name"
      :rows-per-page-options="tableConf.rowsPerPage"
      :pagination="tableConf.pagination"
      separator="cell"
      :no-data-label="loading ? 'Updating ...' : 'No mission templates defined'"
    >
      <template v-slot:top>
        <div class="full-width row justify-between items-center">
          <div class="col-auto text-h5">Mission templates</div>
          <div
            v-if="missionTplBasic && missionTplBasic.retrievedAt"
            class="q-ml-lg text-grey"
            style="font-size: smaller"
          >
            <ElapsedTime
              :date="missionTplBasic.retrievedAt"
              tooltip="Last listing from the provider"
            />
          </div>
        </div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td
            key="missionTplId"
            :props="props"
            style="width: 5px; vertical-align: top"
          >
            <div class="row no-wrap items-center q-gutter-x-xs">
              <q-icon
                class="q-mr-xs"
                :name="`far ${
                  props.row.missionTplId.endsWith('/')
                    ? 'fa-folder'
                    : 'fa-file-alt'
                }`"
                size="12px"
              />
              <router-link
                class="appLink"
                :to="
                  utl.routeLoc([
                    'p',
                    params.providerId,
                    'mt',
                    props.row.missionTplId,
                  ])
                "
              >
                {{ props.row.missionTplId }}
              </router-link>
            </div>
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
        </q-tr>
      </template>
    </q-table>
    <div v-if="debug">
      <!--
          <pre>params = {{ route.params }}</pre>
          <pre>MissionTemplatesPage: templates={{ templates }}</pre>
      -->
      <pre>missionTplBasic={{ missionTplBasic }}</pre>
    </div>
  </q-page>
</template>
