<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUtlStore } from 'stores/utl'
import { useMutation, useQuery, useSubscription } from '@vue/apollo-composable'

import {
  ARGUMENT_DELETE,
  ARGUMENT_INSERT,
  ARGUMENT_UPDATE,
  MISSION,
  MISSION_UPDATED_BY_ID,
  MISSION_DELETE,
  MISSION_UPDATE,
  MISSION_VALIDATE,
  UPDATE_MISSION_TEMPLATE,
} from './queries'

import { UNITS } from '../units/queries'

import { computed, inject, nextTick, ref, watch } from 'vue'
import ElapsedTime from 'components/utl/ElapsedTime.vue'
import MxmMarkdown from 'components/utl/markdown/MxmMarkdown.vue'
import MissionScheduling from './MissionScheduling.vue'
import UnitSelect from 'pages/providers/UnitSelect.vue'
import { useQuasar } from 'quasar'
import ParameterValue from 'components/paramInput/ParameterValue.vue'

const debug = window.location.search.match(/.*debug=(-|.*\bmission\b).*/)

const { mutate: missionValidate } = useMutation(MISSION_VALIDATE)
const { mutate: missionUpdate } = useMutation(MISSION_UPDATE)
const { mutate: missionDelete } = useMutation(MISSION_DELETE)

// used to load parameters when not full template has been loaded yet
const { mutate: missionTemplateUpdate, loading: updatingMissionTemplate } =
  useMutation(UPDATE_MISSION_TEMPLATE)

const { mutate: argumentInsert } = useMutation(ARGUMENT_INSERT)
const { mutate: argumentUpdate } = useMutation(ARGUMENT_UPDATE)
const { mutate: argumentDelete } = useMutation(ARGUMENT_DELETE)

const utl = inject('utl')

const $q = useQuasar()

const route = useRoute()

const params = computed(() => route.params)
const providerId = computed(() => params.value.providerId)
const missionTplId = computed(() => params.value.missionTplId)
const missionId = computed(() => params.value.missionId)

const {
  result: missionResult,
  loading,
  refetch: refetchMission,
} = useQuery(MISSION, { providerId, missionTplId, missionId })

// reflect any async status updates
useSubscription(MISSION_UPDATED_BY_ID, { providerId, missionTplId, missionId })

const mission = computed(() => missionResult.value?.mission ?? {})
const missionTemplate = computed(() => mission.value?.missionTemplate ?? {})
const provider = computed(() => mission.value?.provider ?? {})
const editable = computed(() => mission.value?.missionStatus === 'DRAFT')

const { result: unitsResult } = useQuery(UNITS)

const units = computed(() => unitsResult.value?.allUnits ?? [])

const unitsByName = computed(() =>
  Object.fromEntries(
    units.value.map(u => [
      u.unitName,
      {
        unitName: u.unitName,
        abbreviation: u.abbreviation,
        baseUnit: u.baseUnit,
      },
    ])
  )
)

async function doMissionStatusUpdate() {
  if (debug) console.debug('doMissionStatusUpdate')
  await updateMission({})
}

async function doMissionTemplateAndMissionUpdate() {
  if (debug) console.debug('doMissionTemplateAndMissionUpdate')
  $q.loading.show({
    message: 'Reloading template',
    messageColor: 'black',
    customClass: 'text-bold',
  })
  const variables = {
    pl: {
      providerId: providerId.value,
      missionTplId: missionTplId.value,
    },
  }
  try {
    const data = await missionTemplateUpdate(variables)
    if (debug) console.debug('updateMissionTemplate: mutation data=', data)
    $q.notify({
      message: 'Mission template reloaded from provider',
      timeout: 1000,
      position: 'top',
      color: 'info',
    })
    // and refresh mission itself:
    await doMissionStatusUpdate()
  } catch (error) {
    utl.exceptionHelper($q, error)
  } finally {
    $q.loading.hide()
  }
}

watch(
  mission,
  async () => {
    if (!updatingMissionTemplate.value && !missionTemplate.value?.retrievedAt) {
      await doMissionTemplateAndMissionUpdate()
    }
  },
  { deep: true }
)

function refreshMission() {
  if (mission.value?.missionStatus === 'DRAFT') {
    doMissionTemplateAndMissionUpdate()
  } else {
    doMissionStatusUpdate()
  }
}

useUtlStore().setRefreshFunction(refreshMission, 'Refresh this mission')

const alreadySavedArgs = computed(() => mission.value?.arguments ?? [])

const parameters = computed(
  () => mission.value?.missionTemplate?.parameters ?? []
)

// TODO
const parametersWithError = computed(() => ({}))
const parametersWithErrorCount = computed(
  () => Object.keys(parametersWithError.value).length
)

const savingArgs = ref(false)
const parametersChanged = computed(() =>
  myArguments.value.filter(
    a => a.paramValue !== a.defaultValue || a.paramUnits !== a.defaultUnits
  )
)

const myArguments = computed(() =>
  parameters.value.map(p => {
    const arg = alreadySavedArgs.value.find(p2 => p2.paramName === p.paramName)
    const paramValue =
      arg && arg.paramValue !== null ? arg.paramValue : p.defaultValue
    const paramUnits = (arg && arg.paramUnits) || p.defaultUnits
    // console.debug('FIND p.paramName=', p.paramName, 'arg=', arg, 'paramValue=', paramValue)
    return {
      paramName: p.paramName,
      type: p.type,
      valueCanReference: p.valueCanReference,
      paramValue,
      paramUnits,
      defaultValue: p.defaultValue,
      defaultUnits: p.defaultUnits,
      required: p.required,
      description: p.description,
    }
  })
)

const disableRun = computed(
  () =>
    mission.value.missionStatus !== 'DRAFT' ||
    parametersWithErrorCount.value > 0 ||
    (provider.value.usesSched &&
      mission.value.schedType === 'DATE' &&
      !mission.value.schedDate)
)

const overriddenFirst = ref(false)

// A workaround to properly reflect the reordering of arguments given that the
// simple toggling of overriddenFirst doesn't seem to propagate all the effects
// (even though that orderedArguments depends on it)
const workaroundForArgsRefresh = ref(true)

function toggleOverriddenFirst() {
  overriddenFirst.value = !overriddenFirst.value
  workaroundForArgsRefresh.value = false
  nextTick(() => {
    workaroundForArgsRefresh.value = true
  })
}

const orderedArguments = computed(() => {
  const overriddenParam = a =>
    a.paramValue !== a.defaultValue || a.paramUnits !== a.defaultUnits

  if (overriddenFirst.value) {
    const ordered = myArguments.value.filter(overriddenParam)
    const others = myArguments.value.filter(a => !overriddenParam(a))
    return ordered.concat(others)
  }
  return myArguments.value
})

function submitMission() {
  $q.dialog({
    title: 'Confirm',
    message: `Submit this <b>${missionTplId.value}</b> mission instance for execution?`,
    html: true,
    color: 'info',
    dark: $q.dark.isActive,
    cancel: true,
  }).onOk(() => doIt())

  // As the mission is always saved upon changes in draft status, the submission effect
  // is accomplished by requesting the status to become 'SUBMITTED'.
  const doIt = async () => {
    const missionStatus = 'SUBMITTED'
    try {
      await updateMission({ missionStatus })
      const message = `Mission submitted. Status: ${mission.value.missionStatus}`
      if (debug) console.debug(message)
      $q.notify({
        message,
        timeout: 2000,
        color: 'info',
        position: 'top',
      })
    } catch (error) {
      console.error('submitMission: postMission: error=', error)
      $q.notify({
        message: `Mission submission error: ${JSON.stringify(error)}`,
        timeout: 0,
        closeBtn: 'Close',
        color: 'warning',
      })
    }
  }
}

async function validateMission() {
  if (debug) console.debug('validateMission')
  const variables = {
    pl: {
      missionId: missionId.value,
      providerId: providerId.value,
      missionTplId: missionTplId.value,
    },
  }
  $q.loading.show({
    message: 'Validating ...',
    messageColor: 'black',
    customClass: 'text-bold',
  })
  try {
    const data = await missionValidate(variables)
    /*if (debug)*/ console.debug('validateMission: mutation data=', data)
    const { ok, error } = data?.data?.validateMission?.result ?? {}
    if (ok) {
      $q.notify({
        message: `Mission validation: ${ok}`,
        timeout: 1000,
        position: 'top',
        color: 'info',
      })
    } else if (error) {
      $q.notify({
        message: `Mission validation error: ${error}`,
        position: 'top',
        timeout: 0,
        closeBtn: 'Close',
        color: 'warning',
      })
    }
  } catch (error) {
    console.error('updateMission: mutation error=', error)
  } finally {
    $q.loading.hide()
  }
}

// TODO cancelMission
function cancelMission() {
  console.warn('cancelMission() not implemented')
}

async function updateMissionSched({ schedType, schedDate }) {
  if (debug)
    console.debug(
      'updateMissionSched: schedType=',
      schedType,
      'schedDate=',
      schedDate
    )
  if (schedType !== 'DATE') {
    schedDate = null
  }

  await updateMission({ schedType, schedDate })
  $q.notify({
    message: 'Mission scheduling updated',
    timeout: 1200,
    color: 'info',
    position: 'top',
  })
}

async function updateMission(missionPatch) {
  if (debug) console.debug('updateMission missionPatch=', missionPatch)
  const variables = {
    pl: {
      ...missionPatch,
      missionId: missionId.value,
      providerId: providerId.value,
      missionTplId: missionTplId.value,
    },
  }
  try {
    const data = await missionUpdate(variables)
    if (debug) console.debug('updateMission: mutation data=', data)
    // TODO apollo mechanism to reflect change, not having to do the refetch necessarily
    refetchMission()
  } catch (error) {
    console.error('updateMission: mutation error=', error)
  }
}

async function updateDescription(description: string) {
  await updateMission({ description })
  $q.notify({
    message: 'Mission description saved',
    timeout: 700,
    color: 'info',
    position: 'top',
  })
}

async function deleteMission() {
  const status = mission.value.missionStatus.toLowerCase()
  $q.dialog({
    title: 'Confirm',
    message: `Delete this <em>${status}</em> mission <b>${missionTplId.value}</b>?`,
    html: true,
    dark: $q.dark.isActive,
    ok: 'Yes',
    cancel: true,
    focus: 'cancel',
  }).onOk(doDeleteMission)

  async function doDeleteMission() {
    const variables = {
      pl: {
        providerId: providerId.value,
        missionTplId: missionTplId.value,
        missionId: missionId.value,
      },
    }
    try {
      const data = await missionDelete(variables)
      if (debug) console.debug('deleteMission: mutation data=', data)
      $q.notify({
        message: `Mission deleted: '${missionId.value}'`,
        timeout: 2000,
        position: 'top',
        color: 'info',
      })
      utl.replace(['p', providerId.value])
    } catch (error) {
      console.error('deleteMission: mutation error=', error)
      $q.notify({
        message: `Mission deletion error: ${JSON.stringify(error)}`,
        timeout: 0,
        closeBtn: 'Close',
        color: 'warning',
      })
    }
  }
}

async function insertArgument(paramName, paramValue, paramUnits, next) {
  const variables = {
    pl: {
      missionId: missionId.value,
      providerId: providerId.value,
      missionTplId: missionTplId.value,
      paramName,
      paramValue,
      paramUnits,
    },
  }
  if (debug) console.debug('insertArgument: variables=', variables)

  try {
    const data = await argumentInsert(variables)
    if (debug) console.debug('insertArgument: mutation data=', data)
    next(true)
  } catch (error) {
    console.error('insertArgument: mutation error=', error)
    next(false)
  }
}

async function updateArgument(paramName, paramValue, paramUnits, next) {
  if (debug)
    console.debug(
      `updateArgument: paramName=${paramName} paramValue=${paramValue} paramUnits=${paramUnits}`
    )
  const variables = {
    pl: {
      missionId: missionId.value,
      providerId: providerId.value,
      missionTplId: missionTplId.value,
      paramName,
      paramValue,
      paramUnits,
    },
  }
  try {
    const data = await argumentUpdate(variables)
    if (debug) console.debug('updateArgument: mutation data=', data)
    next(true)
  } catch (error) {
    console.error('updateArgument: mutation error=', error)
    next(false)
  }
}

async function deleteArgument(paramName, next) {
  const variables = {
    pl: {
      missionId: missionId.value,
      providerId: providerId.value,
      missionTplId: missionTplId.value,
      paramName,
    },
  }
  try {
    const data = await argumentDelete(variables)
    if (debug) console.debug('deleteArgument: mutation data=', data)
    next(true)
  } catch (error) {
    console.error('deleteArgument: mutation error=', error)
    next(false)
  }
}

function saveArguments(row) {
  if (debug) console.debug('saveArguments: row=', row)
  if (savingArgs.value) {
    return
  }

  savingArgs.value = true

  let numInserted = 0
  let numUpdated = 0
  let numDeleted = 0

  const argList = [...myArguments.value]
  const nextArg = () => {
    const arg = argList.pop()
    if (!arg) {
      if (debug)
        console.debug(
          `saveArguments DONE: numInserted=${numInserted} numUpdated=${numUpdated} numDeleted=${numDeleted}`
        )

      savingArgs.value = false
      if (numInserted || numUpdated || numDeleted) {
        refetchMission()
        $q.notify({
          message: 'Arguments updated',
          timeout: 700,
          position: 'top',
          color: 'info',
        })
      }
      return
    }

    if (debug)
      console.debug(
        `saveArguments: checking ${arg.paramName}`,
        `v='${arg.paramValue}' dv='${arg.defaultValue}'`
      )

    const alreadySavedArg = alreadySavedArgs.value.find(
      x => x.paramName === arg.paramName
    )

    if (debug) console.debug(arg.paramName, 'alreadySavedArg=', alreadySavedArg)

    if (
      arg.paramValue !== arg.defaultValue ||
      arg.paramUnits !== arg.defaultUnits
    ) {
      if (alreadySavedArg) {
        if (
          alreadySavedArg.paramValue !== arg.paramValue ||
          alreadySavedArg.paramUnits !== arg.paramUnits
        ) {
          if (debug) console.debug(arg.paramName, 'UPDATING', arg.paramValue)
          updateArgument(
            alreadySavedArg.paramName,
            arg.paramValue,
            arg.paramUnits,
            ok => {
              if (ok) {
                numUpdated++
              }
              nextArg()
            }
          )
        } else nextArg()
      } else {
        if (debug) console.debug(arg.paramName, 'INSERTING', arg.paramValue)
        insertArgument(arg.paramName, arg.paramValue, arg.paramUnits, ok => {
          if (ok) {
            numInserted++
          }
          nextArg()
        })
      }
    } else {
      // arg has the default value.
      if (alreadySavedArg) {
        if (debug) console.debug(arg.paramName, 'DELETING', arg.paramName)
        deleteArgument(alreadySavedArg.paramName, ok => {
          if (ok) {
            numDeleted++
          }
          nextArg()
        })
      } else nextArg()
    }
  }

  if (debug) console.debug('saveArguments START')
  nextArg()
}

const filter = ref('')

const tableConf = computed(() => {
  const columns = [
    {
      field: 'paramName',
      name: 'paramName',
      label: 'Parameter',
      align: 'left',
    },
    {
      field: 'paramValue',
      name: 'paramValue',
      label: 'Value',
      align: 'left',
    },
  ]
  if (mission.value?.provider?.usesUnits) {
    columns.push({
      field: 'paramUnits',
      name: 'paramUnits',
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
      rowsPerPage: 0,
    },
  }
})
</script>

<template>
  <q-page class="q-pa-sm">
    <div v-if="!loading && mission.missionId">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row no-wrap q-gutter-x-lg">
            <div class="column q-gutter-y-sm">
              <div class="row no-wrap items-center q-gutter-x-sm">
                <div>Mission:</div>
                <div class="text-bold">{{ mission.missionId }}</div>
                <div class="row no-wrap items-center q-gutter-x-sm">
                  <div class="text-grey">Status:</div>
                  <div class="text-bold">{{ mission.missionStatus }}</div>
                  <div class="text-grey" style="font-size: smaller">
                    <ElapsedTime
                      :date="mission.updatedDate"
                      tooltip="Time of last status update"
                    />
                  </div>
                </div>
              </div>
              <div
                class="row no-wrap items-center q-gutter-x-sm"
                style="font-size: smaller"
              >
                <div class="text-gray">Template:</div>
                <div>
                  <router-link
                    class="appLink"
                    :to="
                      utl.routeLoc([
                        'p',
                        mission.providerId,
                        'mt',
                        mission.missionTplId,
                      ])
                    "
                  >
                    {{ mission.missionTplId }}
                  </router-link>
                </div>

                <div class="row text-grey" style="font-size: smaller">
                  <ElapsedTime
                    :date="mission?.missionTemplate?.retrievedAt"
                    tooltip="Time of last template update"
                  />
                </div>
              </div>
              <div class="row items-center q-gutter-x-xs">
                <div class="text-gray">Asset:</div>
                <div>
                  <router-link
                    class="appLink"
                    :to="
                      utl.routeLoc([
                        'p',
                        params.providerId,
                        'a',
                        mission.assetId,
                      ])
                    "
                  >
                    {{ mission.assetId }}
                    <q-tooltip>
                      {{ mission.asset.className }}
                    </q-tooltip>
                  </router-link>
                </div>
              </div>

              <div
                class="row no-wrap items-center q-gutter-x-sm"
                style="font-size: smaller"
              >
                <div>PMID:</div>
                <div>
                  {{ mission.providerMissionId || '??' }}
                </div>
                <q-tooltip>Provider mission ID, if already assigned</q-tooltip>
              </div>
            </div>
            <MxmMarkdown
              expandable
              expandable-title="Description:"
              :text="mission.description"
              :start-markdown="provider.descriptionFormat === 'markdown'"
              :editable="editable"
              @saveDescription="updateDescription"
            />
          </div>
          <table class="mission-table" style="font-size: smaller">
            <tbody>
              <tr v-if="mission.start">
                <td>Start:</td>
                <td>{{ mission.start }}</td>
              </tr>
              <tr v-if="mission.end">
                <td>End:</td>
                <td>{{ mission.end }}</td>
              </tr>
            </tbody>
          </table>
        </q-card-section>
      </q-card>

      <div
        v-if="provider && provider.usesSched"
        class="row q-mb-sm q-gutter-x-lg"
      >
        <MissionScheduling
          :sched-info="{
            schedType: mission.schedType,
            schedDate: mission.schedDate,
          }"
          :editable="mission.missionStatus === 'DRAFT'"
          @schedInfo="updateMissionSched"
        />
      </div>

      <div class="row q-mb-sm justify-between">
        <div class="row q-gutter-x-lg">
          <q-btn
            v-if="provider.canValidate"
            label="Validate"
            icon="check"
            push
            color="secondary"
            size="sm"
            :disable="
              mission.missionStatus !== 'DRAFT' || parametersWithErrorCount > 0
            "
            @click="validateMission"
          >
            <q-tooltip>Validate mission against external provider</q-tooltip>
          </q-btn>
          <q-btn
            label="Submit"
            icon="settings"
            push
            color="secondary"
            size="sm"
            :disable="disableRun"
            @click="submitMission"
          >
            <q-tooltip>Request execution of this mission</q-tooltip>
          </q-btn>
          <q-btn
            v-if="
              mission.missionStatus === 'RUNNING' ||
              mission.missionStatus === 'QUEUED'
            "
            label="Cancel"
            icon="cancel"
            push
            color="secondary"
            size="sm"
            @click="cancelMission"
          >
            <q-tooltip>Request cancellation of submitted mission</q-tooltip>
          </q-btn>
        </div>
        <q-btn
          label="Delete"
          icon="delete"
          push
          color="secondary"
          size="sm"
          :disable="
            mission.missionStatus !== 'DRAFT' &&
            mission.missionStatus !== 'TERMINATED'
          "
          @click="deleteMission"
        >
          <q-tooltip>
            Delete this mission (only allowed if in DRAFT or TERMINATED status)
          </q-tooltip>
        </q-btn>
      </div>

      <q-table
        v-if="workaroundForArgsRefresh"
        :dense="$q.screen.lt.md"
        :rows="orderedArguments"
        :columns="tableConf.columns"
        row-key="name"
        :rows-per-page-options="tableConf.rowsPerPage"
        :pagination="tableConf.pagination"
        :filter="filter"
        separator="cell"
        :no-data-label="`No parameters defined in mission template: '${mission.missionTplId}'`"
      >
        <template v-slot:top>
          <div class="col full-width">
            <div v-if="parameters.length" class="row q-gutter-lg no-wrap">
              <div class="row vertical-middle text-weight-light text-grey">
                <div :class="{ 'text-green': parametersChanged.length }">
                  Overridden parameters: {{ parametersChanged.length }}
                </div>
                <q-btn
                  v-if="parametersChanged.length"
                  class="q-ml-md"
                  icon="arrow_upward"
                  dense
                  round
                  color="green-4"
                  size="xs"
                  :outline="!overriddenFirst"
                  @click="toggleOverriddenFirst"
                >
                  <q-tooltip>Show overridden parameters first</q-tooltip>
                </q-btn>
              </div>
              <div
                v-if="parametersWithErrorCount"
                class="vertical-middle text-red"
              >
                Arguments missing or with error: {{ parametersWithErrorCount }}
              </div>
            </div>

            <div class="full-width row items-center">
              <div class="col-auto text-h5">Arguments</div>

              <div class="q-ml-md row">
                <q-input
                  v-if="myArguments.length"
                  class="col"
                  color="secondary"
                  v-model="filter"
                  placeholder="Filter"
                  clearable
                />
              </div>
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
              <q-tooltip v-if="true">
                <pre>row={{ props.row }}</pre>
                <pre v-if="unitsByName.length">
unit={{ unitsByName[props.row.paramUnits] }}</pre
                >
              </q-tooltip>
              <div
                style="font-size: 1.1em"
                :class="`${props.row.required ? 'text-bold' : ''}`"
              >
                {{ props.row.paramName }}
              </div>

              <div class="text-grey-7 q-mt-sm" style="font-size: 0.8em">
                {{ props.row.type }}
                <span v-if="props.row.valueCanReference">
                  | {{ props.row.valueCanReference }}
                </span>
              </div>
            </q-td>

            <q-td
              key="paramValue"
              :props="props"
              style="width: 12em; font-family: monospace; vertical-align: top"
              class="paramValueCell"
            >
              <ParameterValue
                style="
                  font-family: monospace;
                  width: 12em;
                  word-break: break-all;
                  font-size: 0.9em;
                  overflow-x: auto;
                "
                :paramRequired="props.row.required"
                :label="`${props.row.paramName}:`"
                :paramName="props.row.paramName"
                :paramType="props.row.type"
                :valueCanReference="props.row.valueCanReference"
                :paramValue="props.row.paramValue"
                :defaultValue="props.row.defaultValue"
                :editable="editable"
                @valueInput="
                  val => {
                    delete parametersWithError[props.row.paramName]
                    props.row.paramValue = val
                    saveArguments(props.row)
                  }
                "
                @valueError="
                  error => {
                    parametersWithError[props.row.paramName] = error
                  }
                "
              />
            </q-td>

            <q-td
              v-if="provider && provider.usesUnits"
              key="paramUnits"
              :props="props"
              style="vertical-align: top; width: 10em"
              class="paramValueCell"
            >
              <UnitSelect
                v-if="props.row.defaultUnits"
                :units="units"
                :unitsByName="unitsByName"
                :value="props.row.paramUnits"
                :resetValue="props.row.defaultUnits"
                :editable="editable"
                @input="
                  val => {
                    props.row.paramUnits = val
                    saveArguments(props.row)
                  }
                "
              >
                <q-tooltip
                  v-if="debug && props.row.paramUnits"
                  anchor="bottom left"
                  self="bottom right"
                >
                  <pre>{{ unitsByName[props.row.paramUnits] }}</pre>
                </q-tooltip>
              </UnitSelect>
            </q-td>

            <q-td key="description" :props="props" style="vertical-align: top">
              <MxmMarkdown
                simple
                hide-empty
                :text="props.row.description"
                :start-markdown="provider.descriptionFormat === 'markdown'"
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <i v-else-if="loading"> Loading... </i>
    <div v-else>
      <div class="text-negative">Not found:</div>
      <table class="q-ml-md">
        <tbody>
          <tr>
            <td>Mission:</td>
            <td />
            <td>{{ params.missionId }}</td>
          </tr>
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

    <div v-if="debug">
      <pre>loading={{ loading }}</pre>
      <pre>MissionPage: mission={{ mission }}</pre>
    </div>
  </q-page>
</template>

<style scoped>
.mission-table td {
  padding: 2px 4px;
  vertical-align: top;
}

body.body--dark .paramValueCell:hover {
  background-color: #333333;
}

.paramValueCell:hover {
  background-color: #eeeeee;
}
</style>
