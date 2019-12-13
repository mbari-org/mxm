<template>
  <q-page class="q-pa-md">
    <div v-if="mission">
      <q-card class="q-mb-md">
        <q-card-section>
          Mission: <q-chip square class="text-bold">{{ mission.missionId }}</q-chip>

          <span class="q-ml-lg" style="font-size:smaller">
            <span style="color:gray">
              Status: <q-chip dense>{{ mission.missionStatus }}</q-chip>
              <q-btn
                v-if="mission.missionStatus !== 'DRAFT'"
                icon="refresh"
                dense color="accent"
                class="q-ml-sm"
                size="xs"
                @click="checkStatus"
              >
                <q-tooltip>Check for status against external executor</q-tooltip>
              </q-btn>
            </span>

            <span class="q-ml-lg" style="color:gray">
              Template:
            </span>
            <span>
              <router-link
                :to="$utl.routeLoc([mission.executorId, 'mt', mission.missionTplId])"
              >
                {{ mission.missionTplId }}
                <q-tooltip>Mission Template</q-tooltip>
              </router-link>
            </span>

            <span class="q-ml-lg" style="color:gray">
              Asset:
            </span>
            <span>
              <router-link
                :to="$utl.routeLoc([params.executorId, 'a', mission.assetId])"
              >
                {{ mission.assetId }}
                <q-tooltip>
                  {{ mission.assetByExecutorIdAndAssetId.className }}
                </q-tooltip>
              </router-link>
            </span>
          </span>
          <table class="mission-table" style="font-size:smaller">
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

        <q-separator/>
        <q-card-section>
          <mxm-markdown
            expandable expandable-title="Description:"
            :text="mission.description"
            :start-markdown="mission.missionTplByExecutorIdAndMissionTplId.executorByExecutorId.descriptionFormat === 'markdown'"
            :editable="editable()"
            @saveDescription="updateDescription"
          />
        </q-card-section>
      </q-card>

      <div class="row q-mb-sm justify-center q-gutter-x-lg">
          <q-btn
            v-if="mission.missionTplByExecutorIdAndMissionTplId.executorByExecutorId.canValidate"
            label="Validate"
            icon="check"
            push color="secondary"
            size="sm"
            :disable="mission.missionStatus !== 'DRAFT' || parametersWithErrorCount > 0"
            @click="validateMission"
          >
            <q-tooltip>Validate mission against external executor</q-tooltip>
          </q-btn>
          <q-btn
            label="Run"
            icon="settings"
            push color="secondary"
            size="sm"
            :disable="mission.missionStatus !== 'DRAFT' || parametersWithErrorCount > 0"
            @click="runMission"
          >
            <q-tooltip>Request execution of this mission</q-tooltip>
          </q-btn>
          <q-btn
            v-if="mission.missionStatus === 'RUNNING' || mission.missionStatus === 'QUEUED'"
            label="Cancel"
            icon="cancel"
            push color="secondary"
            size="sm"
            @click="cancelMission"
          >
            <q-tooltip>Request cancelation of submitted mission</q-tooltip>
          </q-btn>
          <q-btn
            label="Delete"
            icon="delete"
            push color="secondary"
            size="sm"
            :disable="mission.missionStatus !== 'DRAFT' && mission.missionStatus !== 'TERMINATED'"
            @click="deleteMission"
          >
            <q-tooltip>
              Delete this mission<br/>
              <span>
                (only if in DRAFT or<br/>
                TERMINATED status)
              </span>
            </q-tooltip>
          </q-btn>
      </div>

      <q-table
        :dense="$q.screen.lt.md"
        :data="myArguments"
        :columns="argColumns"
        row-key="name"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
        separator="cell"
        :no-data-label="`No parameters defined in the mission template '${mission.missionTplId}'`"
      >
        <div slot="top-left" slot-scope="props" class="row items-center">
          <div class="col">
            <div class="row q-gutter-lg">
              <div class="vertical-middle text-weight-light text-grey">
                Overridden parameters: {{parametersChanged().length}}
              </div>
              <div
                v-if="parametersWithErrorCount"
                class="vertical-middle text-red"
              >
                Arguments missing or with error: {{parametersWithErrorCount}}
              </div>
            </div>

            <div class="row">
              <div class="col-auto text-h5">
                Arguments
              </div>

              <div class="q-ml-md row">
                <q-input
                  v-if="myArguments"
                  class="col"
                  color="secondary"
                  v-model="filter"
                  placeholder="Filter"
                  clearable
                />
              </div>
            </div>
          </div>
        </div>

        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td key="paramName" :props="props"
                style="width:5px;font-family:monospace;vertical-align:top"
          >
            <q-btn
              no-caps dense
              style="min-width:3em; font-size:small"
              :class="`text-primary ${props.row.required ? 'text-bold' : ''}`"
              :to="$utl.routeLoc([mission.executorId, 'mt', mission.missionTplId, 'p', props.row.paramName])"
            >
              {{ props.row.paramName }}
            </q-btn>

            <div
              class="text-grey-7 q-mt-sm" style="font-size:0.8em"
            >
              ({{ props.row.type }})
            </div>

            <div
              v-if="props.row.valueCanReference"
              class="text-grey-7 q-mt-sm" style="font-size:0.8em"
            >
              ({{ props.row.valueCanReference }})
            </div>
          </q-td>

          <q-td key="paramValue" :props="props"
                style="width:20em;font-family:monospace;vertical-align:top"
          >
            <q-field
              :error="!!valueError(props.row)"
              :error-message="valueError(props.row)"
              :class="paramValueClass(props.row)"
               style="white-space: normal"
            >
              <parameter-value
                :ref="`parameter-value_${props.row.paramName}`"
                class="q-pa-xs"
                style="font-family:monospace;min-width:24em;word-break:break-all;font-size:0.9em"
                :param-required="props.row.required"
                :label="`${props.row.paramName}:`"
                :param-name="props.row.paramName"
                :param-type="props.row.type"
                :value-can-reference="props.row.valueCanReference"
                :param-value="props.row.paramValue"
                :original-value="props.row.defaultValue"
                :editable="editable()"
                @save="val => { props.row.paramValue = val; saveArguments(props.row) }"
              />
            </q-field>

            <q-chip
              v-if="props.row.paramUnits"
              :class="'q-ml-md ' + paramUnitsClass(props.row)"
            >
              {{ props.row.paramUnits }}
            </q-chip>
          </q-td>

          <q-td key="description" :props="props"
                style="vertical-align:top"
          >
            <mxm-markdown
              simple hide-empty :text="props.row.description"
              :start-markdown="mission.missionTplByExecutorIdAndMissionTplId.executorByExecutorId.descriptionFormat === 'markdown'"
            />
          </q-td>
        </q-tr>
      </q-table>
    </div>

    <div v-else-if="!loading">
      <div class="text-negative">Not found:</div>
      <table class="q-ml-md">
        <tbody>
        <tr><td>Mission:<td/><td>{{params.missionId}}</td></tr>
        <tr><td>Mission Template:<td/><td>{{params.missionTplId}}</td></tr>
        <tr><td>Executor:<td/><td>{{params.executorId}}</td></tr>
        </tbody>
      </table>
    </div>
  </q-page>
</template>

<style>
  .mission-table td {
    padding: 2px 4px;
    vertical-align: top;
  }
</style>

<script>
  import missionGql from '../graphql/mission.gql'
  import argumentInsertGql from '../graphql/argumentInsert.gql'
  import argumentUpdateGql from '../graphql/argumentUpdate.gql'
  import argumentDeleteGql from '../graphql/argumentDelete.gql'
  import missionUpdateGql from '../graphql/missionUpdate.gql'
  import missionDeleteGql from '../graphql/missionDelete.gql'

  import ParameterValue from 'components/parameter-value'
  import ParameterValueInput from 'components/parameter-value-input'

  import get from 'lodash/get'
  import map from 'lodash/map'
  import find from 'lodash/find'
  import filter from 'lodash/filter'
  import clone from 'lodash/clone'
  import assign from 'lodash/assign'
  import reduce from 'lodash/reduce'
  import size from 'lodash/size'

  const debug = window.location.search.match(/.*debug=.*mission.*/)

  export default {
    components: {
      ParameterValue,
      ParameterValueInput,
    },

    data: () => ({
      debug,
      loading: false,
      mission: null,
      executor: null,
      savingArgs: false,

      myArguments: [],
      parametersWithError: {},

      argColumns: [
        {
          field: 'paramName',
          name: 'paramName',
          label: 'Parameter',
          align: 'left',
          sortable: true
        },
        {
          field: 'paramValue',
          name: 'paramValue',
          label: 'Value',
          align: 'left',
        },
        {
          field: 'description',
          name: 'description',
          label: 'Description',
          align: 'left',
        }
      ],
      rowsPerPage: [0],
      pagination: {
        rowsPerPage: 0
      },
      filter: '',
    }),

    computed: {
      params() {
        return this.$route.params
      },

      parametersWithErrorCount() {
        return size(this.parametersWithError)
      },
    },

    mxmProviderClient: null,

    apollo: {
      mission: {
        query: missionGql,
        variables() {
          return {
            executorId: this.params.executorId,
            missionTplId: this.params.missionTplId,
            missionId: this.params.missionId,
          }
        },
        update(data) {
          if (debug) console.debug('update: data=', data)
          let mission = null

          if (data.missionByExecutorIdAndMissionTplIdAndMissionId) {
            mission = data.missionByExecutorIdAndMissionTplIdAndMissionId

            this.executor = mission.missionTplByExecutorIdAndMissionTplId.executorByExecutorId
            this.mxmProviderClient = this.$createMxmProvideClient({
              httpEndpoint: this.executor.httpEndpoint,
              apiType: this.executor.apiType,
            })
          }
          this.setMyArgumentsFromSaved(mission)
          return mission
        },
      },
    },

    mounted() {
      this.$store.commit('utl/setBreadcrumbs', {
        elements: [
          ['Home', []],
          [this.params.executorId, [this.params.executorId]],
          ['Missions', [this.params.executorId, 'm']],
          [this.params.missionId],
        ],
        refresh: this.refreshMission
      })

      this.parametersWithError = {}
      this.refreshMission()
    },

    methods: {
      refreshMission() {
        this.$apollo.queries.mission.refetch()
      },

      editable() {
        return this.mission.missionStatus === 'DRAFT'
      },

      setMyArgumentsFromSaved(mission) {
        if (debug) console.debug('setMyArgumentsFromSaved mission=', mission)
        const alreadySavedArgs = get(mission, 'argumentsByExecutorIdAndMissionTplIdAndMissionIdList') || []
        const parameters = get(mission, 'missionTplByExecutorIdAndMissionTplId.parametersByExecutorIdAndMissionTplIdList') || []

        if (debug) console.debug('alreadySavedArgs=', alreadySavedArgs)

        this.myArguments = map(parameters, p => {
          const arg = find(alreadySavedArgs, {paramName: p.paramName})
          const paramValue = arg && arg.paramValue || p.defaultValue
          const paramUnits = arg && arg.paramUnits || p.defaultUnits
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
      },

      paramValueClass(row) {
        if (this.valueError(row)) {
          return 'rounded-borders q-pa-xs bg-red-1 text-bold" style="color:white'
        }
        else if ((row.paramValue || '') !== (row.defaultValue || '')) {
          return 'rounded-borders q-pa-xs bg-green-11'
        }
        else {
          return 'rounded-borders q-pa-xs bg-green-1'
        }
      },

      paramUnitsClass(row) {
        if (row.paramUnits !== row.defaultUnits) {
          return 'rounded-borders q-pa-xs bg-green-11'
        }
        else {
          return 'rounded-borders q-pa-xs bg-green-1'
        }
      },

      valueError(row) {
        const {paramName} = row
        const parval = this.$refs[`parameter-value_${paramName}`]
        const error = parval && parval.errorMessage()
        if (error) {
          this.$set(this.parametersWithError, paramName, error)
        }
        else {
          this.$delete(this.parametersWithError, paramName)
        }
        return error
      },

      parametersChanged() {
        return filter(this.myArguments, a => a.paramValue !== a.defaultValue)
      },

      saveArguments(row) {
        if (this.savingArgs) {
          return
        }

        this.savingArgs = true

        const alreadySavedArgs = get(this.mission, 'argumentsByExecutorIdAndMissionTplIdAndMissionIdList') || []
        if (debug) console.debug('saveArguments: alreadySavedArgs=', alreadySavedArgs)

        let numInserted = 0
        let numUpdated = 0
        let numDeleted = 0

        const argList = clone(this.myArguments)
        const nextArg = () => {
          const arg = argList.pop()
          if (!arg) {
            if (debug) console.debug('saveArguments DONE: numInserted=', numInserted,
              'numUpdated=', numUpdated, 'numDeleted=', numDeleted)

            this.savingArgs = false
            if (numInserted || numUpdated || numDeleted) {
              this.refreshMission()
              this.$q.notify({
                message: `Arguments updated`,
                timeout: 700,
                position: 'top',
                color: 'info',
              })
            }
            return
          }

          if (debug) console.debug('saveArguments: checking', arg.paramName,
            `v='${arg.paramValue}' dv='${arg.defaultValue}'`)

          const alreadySavedArg = find(alreadySavedArgs, x => x.paramName === arg.paramName)
          if (debug) console.debug(arg.paramName, 'alreadySavedArg=', alreadySavedArg)

          if (arg.paramValue !== arg.defaultValue) {
            if (alreadySavedArg) {
              if (alreadySavedArg.paramValue !== arg.paramValue) {
                if (debug) console.debug(arg.paramName, 'UPDATING', arg.paramValue)
                this.updateArgument(alreadySavedArg.id, arg.paramValue, ok => {
                  if (ok) {
                    numUpdated++
                  }
                  nextArg()
                })
              }
              else nextArg()
            }
            else {
              if (debug) console.debug(arg.paramName, 'INSERTING', arg.paramValue)
              this.insertArgument(arg.paramName, arg.paramValue, ok => {
                if (ok) {
                  numInserted++
                }
                nextArg()
              })
            }
          }
          else {
            // arg has the default value.
            if (alreadySavedArg) {
              if (debug) console.debug(arg.paramName, 'DELETING', arg.paramName)
              this.deleteArgument(alreadySavedArg.id, ok => {
                if (ok) {
                  numDeleted++
                }
                nextArg()
              })
            }
            else nextArg()
          }
        }

        if (debug) console.debug('saveArguments START')
        nextArg()
      },

      insertArgument(paramName, paramValue, next) {
        const mutation = argumentInsertGql
        const variables = {
          missionId: this.params.missionId,
          executorId: this.mission.executorId,
          missionTplId: this.mission.missionTplId,
          paramName,
          paramValue
        }
        if (debug) console.debug('insertArgument: variables=', variables)

        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('insertArgument: mutation data=', data)
            next(true)
          })
          .catch((error) => {
            console.error('insertArgument: mutation error=', error)
            next(false)
          })
      },

      updateArgument(id, paramValue, next) {
        const mutation = argumentUpdateGql
        const variables = {
          input: {
            id,
            argumentPatch: {
              paramValue
            }
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateArgument: mutation data=', data)
            next(true)
          })
          .catch((error) => {
            console.error('updateArgument: mutation error=', error)
            next(false)
          })
      },

      deleteArgument(id, next) {
        const mutation = argumentDeleteGql
        const variables = {
          input: {
            id
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('deleteArgument: mutation data=', data)
            next(true)
          })
          .catch((error) => {
            console.error('deleteArgument: mutation error=', error)
            next(false)
          })
      },

      updateDescription(description) {
        this.updateMission({description})
            .then(() => {
              this.$q.notify({
                message: 'Mission description saved',
                timeout: 700,
                color: 'info',
                position: 'top',
              })
            })
      },

      updateMissionStatus(missionStatus) {
        return this.updateMission({missionStatus})
      },

      updateMission(missionPatch) {
        return new Promise((resolve, reject) => {
          console.debug('updateMission missionPatch=', missionPatch)
          const mutation = missionUpdateGql
          const variables = {
            input: {
              id: this.mission.id,
              missionPatch
            }
          }
          this.$apollo.mutate({mutation, variables})
            .then((data) => {
              if (debug) console.debug('updateMission: mutation data=', data)
              assign(this.mission, missionPatch)
              resolve(missionPatch)
            })
            .catch(error => {
              console.error('updateMission: mutation error=', error)
              reject(error)
            })
        })
      },

      // TODO
      validateMission() {
        this.$q.notify({
          message: `TODO validateMission`,
          timeout: 100,
          position: 'center'
        })
      },

      // TODO
      cancelMission()   {
        this.$q.notify({
          message: `TODO cancelMission`,
          timeout: 100,
          position: 'center'
        })
      },

      runMission() {
        if (!this.mxmProviderClient.isSupportedInterface()) {
          this.$q.notify({
            message: `Operation not implemented yet for apiType=${this.executor.apiType}`,
            timeout: 4000,
            position: 'top',
            color: 'warning',
          })
          return
        }

        this.$q.dialog({
          title: 'Confirm',
          message: `Submit mission '${this.mission.missionId}' for execution?`,
          color: 'primary',
          cancel: true
        }).onOk(() => doIt())

        const doIt = () => {
          const httpEndpoint = this.executor.httpEndpoint
          //console.debug('httpEndpoint=', this.executor.httpEndpoint)
          //console.debug('apiType=', this.executor.apiType)

          // console.debug('myArguments=', this.myArguments)
          const parametersChanged = this.parametersChanged()
          console.debug('parametersChanged=', parametersChanged)
          const args = reduce(parametersChanged, (obj, {paramName, paramValue, type, paramUnits}) => {
            obj[paramName] = {
              value: convertValue(paramValue, type),
              units: paramUnits,
            }
            return obj
          }, {})

          const data = {
            missionTplId: this.params.missionTplId,
            missionId: this.params.missionId,
            assetId: this.mission.assetId,
            description: this.mission.description,
            arguments: args,
          }

          console.debug('runMission: payload=', data)
          // return

          this.mxmProviderClient.postMission(data)
            .then(res => {
              if (!res.status) {
                this.$q.notify("Executor reported no status for mission submission")
                return
              }
              const status = res.status
              this.updateMissionStatus(status)
                .then(_ => {
                  this.$q.notify({
                    message: `Mission submitted. Status: ${status}`,
                    timeout: 2000,
                    color: 'info',
                    position: 'top',
                  })
                  this.refreshMission()
                })
            })
            .catch(error => {
              this.$q.notify({
                message: `Mission submission error: ${JSON.stringify(error)}`,
                timeout: 0,
                closeBtn: 'Close',
                color: 'warning',
              })
              console.error('runMission: postMission: error=', error)
            })
        }
      },

      checkStatus() {
        if (!this.mxmProviderClient.isSupportedInterface()) {
          this.$q.notify({
            message: `Operation not implemented yet for apiType=${this.executor.apiType}`,
            timeout: 4000,
            position: 'top',
            color: 'warning',
          })
          return
        }

        this.mxmProviderClient.getMissionById(this.mission.missionId)
          .then(res => {
            console.debug('getMission: res=', res)
            if (!res.status) {
              this.$q.notify("Executor reported no status")
              return
            }
            const status = res.status
            this.$q.notify({
              message: `Status: ${status}`,
              timeout: 1000,
              color: 'info',
              position: 'top-left'
            })
            if (this.mission.missionStatus !== status) {
              this.updateMissionStatus(status)
                .then(_ => {
                  this.refreshMission()
                })
            }
          })
          .catch(error => {
            console.error('checkStatus: getMission: error=', error)
            if (error === 'No such mission') {
              // assume we get back to DRAFT
              this.$q.notify({
                message: `No such mission in the executor. Returning to DRAFT status`,
                timeout: 0,
                closeBtn: 'Close',
                color: 'info'
              })
              this.updateMissionStatus('DRAFT')
                .then(_ => {
                  this.refreshMission()
                })
            }
            else {
              this.$q.notify({
                message: `Mission submission error: ${JSON.stringify(error)}`,
                timeout: 0,
                closeBtn: 'Close',
                color: 'info',
              })
            }
          })
      },

      deleteMission() {
        this.$q.dialog({
          title: 'Confirm',
          message: `Are you sure you want to delete this mission '${this.mission.missionId}'`,
          color: 'negative',
          ok: `Yes, delete '${this.mission.missionId}'`,
          cancel: true,
          focus: 'cancel',
        }).onOk(() => {
          const mutation = missionDeleteGql
          const variables = {
            input: {
              id: this.mission.id,
            }
          }
          this.$apollo.mutate({mutation, variables})
            .then((data) => {
              if (debug) console.debug('deleteMission: mutation data=', data)
              this.$q.notify({
                message: `Mission deleted: '${this.mission.missionId}'`,
                timeout: 2000,
                position: 'top',
                color: 'info',
              })
              this.$utl.replace([this.mission.executorId])
            })
            .catch((error) => {
              console.error('deleteMission: mutation error=', error)
              this.$q.notify({
                message: `Mission deletion error: ${JSON.stringify(error)}`,
                timeout: 0,
                closeBtn: 'Close',
                color: 'warning',
              })
            })
        })
      },
    },

    watch: {
      '$route'() {
        this.refreshMission()
      }
    }
  }

  // TODO convertValue still pretty ad hoc
  function convertValue(value, type) {
    switch (type) {
      case 'float': return parseFloat(value)
      case 'int': return parseInt(value)
      case 'boolean': return value && value.toLowerCase() === 'true'
      case 'string': return value

      // https://tools.ietf.org/html/rfc7946#section-3.1.1
      case 'Point': return JSON.parse(value)
      case 'MultiPoint': return JSON.parse(value)
      case 'LineString': return JSON.parse(value)
      case 'MultiLineString': return JSON.parse(value)
      case 'Polygon': return JSON.parse(value)
      case 'MultiPolygon': return JSON.parse(value)
      case 'GeometryCollection': return JSON.parse(value)

      // https://tools.ietf.org/html/rfc7946#section-3.2
      case 'Feature': return JSON.parse(value)
      case 'FeatureCollection': return JSON.parse(value)

      // https://tools.ietf.org/html/rfc7946#section-3
      case 'GeoJSON': return JSON.parse(value)

      default: return value
    }
  }
</script>
