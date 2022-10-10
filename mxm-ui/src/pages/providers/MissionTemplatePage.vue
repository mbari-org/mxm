<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUtlStore } from 'stores/utl'
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

import { MISSION_TEMPLATE, UPDATE_MISSION_TEMPLATE } from './queries'
import { useMutation, useQuery } from '@vue/apollo-composable'
import MxmMarkdown from 'components/utl/markdown/MxmMarkdown.vue'
import ParameterValue from 'components/paramInput/ParameterValue.vue'

import ElapsedTime from 'components/utl/ElapsedTime.vue'

const debug = window.location.search.match(/.*debug=(-|.*\bmissiontpl\b).*/)

const route = useRoute()

const params = computed(() => route.params)
const providerId = computed(() => params.value.providerId)
const missionTplId = computed(() => params.value.missionTplId)

const {
  result,
  loading,
  refetch: refetchMissionTemplate,
} = useQuery(MISSION_TEMPLATE, {
  providerId,
  missionTplId,
})

const missionTpl = computed(() => result.value?.missionTemplate ?? {})

const myAssetClasses = computed(() => missionTpl.value?.assetClasses ?? [])

const myParameters = computed(() => missionTpl.value?.parameters ?? [])

const { mutate: updateMissionTemplate } = useMutation(UPDATE_MISSION_TEMPLATE)

onMounted(() => {
  if (!missionTpl.value.retrievedAt) {
    reloadMissionTpl()
  }
})

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
      message: 'Mission template updated',
      timeout: 1000,
      position: 'top',
      color: 'info',
    })
  } catch (error) {
    console.error('updateMissionTplBasic: mutation error=', error)
  }
}

async function reloadMissionTpl() {
  $q.loading.show({
    message: `Reloading template ${missionTplId.value} ...`,
    messageColor: 'black',
    customClass: 'text-bold',
  })
  try {
    // TODO get updated info from the mutation itself
    await updateMissionTplBasic()
    await refetchMissionTemplate()
  } finally {
    $q.loading.hide()
  }
}

useUtlStore().setRefreshFunction(reloadMissionTpl, 'Refresh mission template')

const filter = ref('')

const tableConf = computed(() => {
  const columns = [
    {
      field: 'paramName',
      name: 'paramName',
      label: 'Parameter',
      align: 'left',
      sortable: true,
    },
    {
      field: 'defaultValue',
      name: 'defaultValue',
      label: 'Default value',
      align: 'left',
    },
  ]
  if (missionTpl.value?.provider?.usesUnits) {
    columns.push({
      field: 'defaultUnits',
      name: 'defaultUnits',
      label: 'Units',
      align: 'left',
    })
  }
  columns.push({
    field: 'description',
    name: 'description',
    label: 'Description',
    align: 'left',
  })

  return {
    columns,
    rowsPerPage: [0],
    pagination: {
      sortBy: 'paramOrder',
      descending: false,
      rowsPerPage: 0,
    },
  }
})
</script>

<template>
  <q-page>
    <div>
      <div v-if="missionTpl">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row q-gutter-x-sm items-center justify-between">
              <div class="row q-gutter-x-sm items-center">
                <div>Mission Template:</div>
                <div class="text-bold" style="font-size: 1.1em">
                  {{ params.missionTplId }}
                </div>
              </div>
              <div class="q-ml-xl row">
                <ElapsedTime
                  :date="missionTpl.retrievedAt"
                  tooltip="Last refresh from the provider"
                />
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="missionTpl.description">
            <MxmMarkdown
              expandable
              expandable-title="Description:"
              :text="missionTpl.description"
              :start-markdown="
                missionTpl.provider.descriptionFormat === 'markdown'
              "
            />
          </q-card-section>
        </q-card>

        <q-card class="q-mb-lg">
          <q-card-section>
            <div v-if="myAssetClasses.length">
              <div class="row q-gutter-x-md items-center">
                <div>
                  Associated asset class{{
                    myAssetClasses.length > 1 ? 'es' : ''
                  }}:
                </div>
                <q-chip
                  class="col-auto shadow-1"
                  v-for="c in myAssetClasses"
                  :key="c.className"
                  square
                  dense
                >
                  <router-link
                    class="appLink"
                    :to="utl.routeLoc(['ac', c.className])"
                  >
                    {{ c.className }}
                  </router-link>
                  <q-tooltip v-if="c.description">
                    {{ c.description }}
                  </q-tooltip>
                </q-chip>
              </div>
            </div>
            <div v-else class="text-grey-7">No associated asset classes</div>
          </q-card-section>
        </q-card>

        <q-table
          :dense="$q.screen.lt.md"
          :rows="myParameters"
          :columns="tableConf.columns"
          row-key="name"
          :rows-per-page-options="tableConf.rowsPerPage"
          :pagination="tableConf.pagination"
          :filter="filter"
          no-data-label="No parameters defined"
        >
          <template v-slot:top>
            <div class="full-width row items-center">
              <div class="col-auto text-h5">Parameters</div>

              <div class="q-ml-md row">
                <q-input
                  v-if="myParameters.length"
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
                key="paramName"
                :props="props"
                style="width: 5px; font-family: monospace; vertical-align: top"
                class="cursor-pointer"
                @dblclick="
                  $router.push(
                    utl.routeLoc([
                      'p',
                      providerId,
                      'mt',
                      missionTplId,
                      'p',
                      props.row.paramName,
                    ])
                  )
                "
              >
                <div
                  style="font-size: 1.1em"
                  :class="`${props.row.required ? 'text-bold' : ''}`"
                >
                  {{ props.row.paramName }}
                  <q-tooltip>
                    <pre>{{ props.row }}</pre>
                  </q-tooltip>
                </div>

                <div class="text-grey-7 q-mt-sm" style="font-size: 0.8em">
                  {{ props.row.type }}
                  <span v-if="props.row.valueCanReference">
                    | {{ props.row.valueCanReference }}
                  </span>
                </div>
              </q-td>

              <q-td
                key="defaultValue"
                :props="props"
                style="width: 12em; font-family: monospace; vertical-align: top"
              >
                <div
                  class="q-pa-xs"
                  style="
                    white-space: normal;
                    min-height: 1.5em;
                    max-width: 12em;
                    overflow-x: auto;
                  "
                >
                  <ParameterValue
                    :label="`${props.row.paramName} default value:`"
                    :param-name="props.row.paramName"
                    :param-type="props.row.type"
                    :param-value="props.row.defaultValue"
                  />
                </div>
              </q-td>

              <q-td
                v-if="missionTpl.provider?.usesUnits"
                key="defaultUnits"
                :props="props"
                style="vertical-align: top"
              >
                {{ props.row.defaultUnits }}
              </q-td>

              <q-td key="description" :props="props">
                <MxmMarkdown
                  simple
                  hide-empty
                  :text="props.row.description"
                  :start-markdown="
                    missionTpl.provider.descriptionFormat === 'markdown'
                  "
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>

      <div v-else-if="!loading">
        <div class="text-negative">Not found:</div>
        <table class="q-ml-md">
          <tbody>
            <tr>
              <td>Mission Template:</td>
              <td />
              <td>{{ params.missionTplId }}</td>
            </tr>
            <tr>
              <td>Provider:</td>
              <td />
              <td>{{ params.providerId }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="debug">
      <pre>myParameters={{ myParameters }}</pre>
      <pre>missionTpl={{ missionTpl }}</pre>
    </div>
  </q-page>
</template>
