<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light" class="q-mb-sm">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/${encodeURIComponent(params.executorId)}`"/>
      <q-breadcrumbs-el label="Missions" :to="`/${encodeURIComponent(params.executorId)}/missions`"/>
      <q-breadcrumbs-el :label="params.missionId"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshMission"
      />
    </q-breadcrumbs>

    <div v-if="mission">

      <q-card class="q-mb-md">
        <q-card-section>
          Mission: <q-chip square class="text-bold">{{ mission.missionId }}</q-chip>
          <span>
            <router-link
              :to="`/${encodeURIComponent(mission.executorId)}/missiontpls/${encodeURIComponent(mission.missionTplId)}`"
              style="color:gray; font-size:smaller; text-decoration:none"
            >
              {{ mission.missionTplId }}
              <q-tooltip>Mission Template</q-tooltip>
            </router-link>
          </span>

          <span class="q-ml-lg" style="font-size:smaller">
            <span style="color:gray">
              Status: <q-chip dense>{{ mission.missionStatus }}</q-chip>
              <q-btn
                v-if="mission.missionStatus !== 'DRAFT'"
                icon="refresh"
                dense color="tertiary"
                class="q-ml-sm"
                size="xs"
                @click="checkStatus"
              >
                <q-tooltip>Check for status against external executor</q-tooltip>
              </q-btn>
            </span>
            <span class="q-ml-lg" style="color:gray">
              Asset:
            </span>
            <span>
              <router-link
                :to="`/${encodeURIComponent(params.executorId)}/assets/${encodeURIComponent(mission.assetId)}`"
                style="text-decoration:none"
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
          Description:
          <mxm-markdown :text="mission.description"/>
          <q-popup-edit
            v-if="mission.missionStatus === 'DRAFT'"
            v-model="mission.description"
            title="Description"
            buttons persistent
            @save="updateDescription"
          >
            <q-input
              v-model.trim="mission.description"
              clearable
              class="bg-green-1 q-pl-md q-pr-md"
              style="font-family:monospace"
              type="textarea"
              rows="3"
              :max-height="300"
              autofocus @keyup.enter.stop
            />
          </q-popup-edit>
        </q-card-section>
      </q-card>

      <div class="row q-mb-sm">
        <div style="margin-left:auto;margin-right:auto">
          <q-btn
            label="Validate"
            icon="check"
            push color="primary"
            size="sm"
            :disable="mission.missionStatus !== 'DRAFT'"
            @click="validateMission"
          >
            <q-tooltip>Validate mission against external executor</q-tooltip>
          </q-btn>
          <q-btn
            label="Run"
            icon="settings"
            push color="primary"
            class="q-ml-sm"
            size="sm"
            :disable="mission.missionStatus !== 'DRAFT'"
            @click="runMission"
          >
            <q-tooltip>Request execution of this mission</q-tooltip>
          </q-btn>
          <q-btn
            label="Cancel"
            icon="cancel"
            push color="primary"
            class="q-ml-sm"
            size="sm"
            :disable="mission.missionStatus !== 'RUNNING' && mission.missionStatus !== 'QUEUED'"
            @click="cancelMission"
          >
            <q-tooltip>Request cancelation of submitted mission</q-tooltip>
          </q-btn>
          <q-btn
            label="Delete"
            icon="delete"
            push color="primary"
            class="q-ml-sm"
            size="sm"
            :disable="mission.missionStatus !== 'DRAFT' && mission.missionStatus !== 'TERMINATED'"
            @click="deleteMission"
          >
            <q-tooltip>
              Delete this mission<br/>
              <span style="font-size:smaller">
                (only if in DRAFT or<br/>
                TERMINATED status)
              </span>
            </q-tooltip>
          </q-btn>
        </div>
      </div>

      <q-table
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
            <div class="row">
              <div style="color:gray;font-size:small" class="col-auto vertical-middle text-weight-light">
                Overridden parameters: {{parametersChanged().length}}
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
                style="width:5px;font-family:monospace"
          >
            <router-link
              style="text-decoration:none"
              :to="`/${encodeURIComponent(mission.executorId)}/missiontpls/${encodeURIComponent(mission.missionTplId)}/params/${encodeURIComponent(props.row.paramName)}`"
            >{{ props.row.paramName }}
            </router-link>

            <div v-if="debug" class="bg-blue-1" style="white-space:wrap;width:200px">
              V={{props.row.paramValue}}
            </div>
          </q-td>

          <q-td key="paramValue" :props="props"
                style="width:20em;font-family:monospace"
          >
            <div
              v-if="!props.row.paramValue && props.row.required"
              class="rounded-borders q-pa-xs bg-red-12 text-bold" style="color:white"
            > ?
            </div>
            <div v-else-if="(props.row.paramValue || '') !== (props.row.defaultValue || '')"
                 class="rounded-borders q-pa-xs bg-green-11"
                 style="white-space: normal"
            >
              {{ props.row.paramValue }}
            </div>
            <div v-else
                 class="rounded-borders q-pa-xs bg-green-1"
                 style="white-space: normal"
            >
              {{ props.row.paramValue }}
            </div>

            <q-popup-edit
              :buttons="mission.missionStatus === 'DRAFT'"
              v-model="props.row.paramValue"
              @save="saveArguments"
            >
              <!-- https://github.com/quasarframework/quasar/issues/2861 -->

              <parameter-value-input
                :param-name="props.row.paramName"
                v-model="props.row.paramValue"
                :param-type="props.row.type"
                :default-value="props.row.defaultValue"
                :editable="mission.missionStatus === 'DRAFT'"
              />
            </q-popup-edit>
          </q-td>

          <q-td key="type" :props="props"
                style="width:5px"
          >
            {{ props.row.type }}
          </q-td>

          <q-td key="required" :props="props"
                style="width:5px"
          >
            {{ props.row.required }}
          </q-td>

          <q-td key="description" :props="props"
          >
            <mxm-markdown simple hide-empty :text="props.row.description"/>
          </q-td>

        </q-tr>

      </q-table>
    </div>

    <div v-else-if="!loading" class="text-negative">
      Mission not found: '{{params.missionId}}'
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
  import executor from '../graphql/executor.gql'
  import mission from '../graphql/mission.gql'
  import argumentInsert from '../graphql/argumentInsert.gql'
  import argumentUpdate from '../graphql/argumentUpdate.gql'
  import argumentDelete from '../graphql/argumentDelete.gql'
  import missionUpdate from '../graphql/missionUpdate.gql'
  import missionDelete from '../graphql/missionDelete.gql'
  import MxmMarkdown from 'components/mxm-markdown'
  import ParameterValueInput from 'components/parameter-value-input'
  import {
    postMission,
    getMission,
  } from 'boot/rest0'

  import Vue from 'vue'
  import get from 'lodash/get'
  import map from 'lodash/map'
  import find from 'lodash/find'
  import filter from 'lodash/filter'
  import clone from 'lodash/clone'
  import assign from 'lodash/assign'
  import reduce from 'lodash/reduce'

  const debug = false

  export default {
    components: {
      MxmMarkdown,
      ParameterValueInput,
    },

    data() {
      return {
        debug,
        loading: false,
        mission: null,
        savingArgs: false,
        myArguments: [],
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
            field: 'type',
            name: 'type',
            label: 'Type',
            align: 'left',
            sortable: true
          },
          {
            field: 'required',
            name: 'required',
            label: 'Required'
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
      }
    },

    computed: {
      params() {
        return this.$route.params
      },
    },

    apollo: {
      executor: {
        query: executor,
        variables() {
          return {
            executorId: this.params.executorId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          if (data.allExecutorsList && data.allExecutorsList.length) {
            return data.allExecutorsList[0]
          }
          else return null
        },
      },
      mission: {
        query: mission,
        variables() {
          return {
            executorId: this.params.executorId,
            missionTplId: this.params.missionTplId,
            missionId: this.params.missionId,
          }
        },
        update(data) {
          let res = null
          if (debug) console.debug('update: data=', data)
          if (data.missionByExecutorIdAndMissionTplIdAndMissionId) {
            res = data.missionByExecutorIdAndMissionTplIdAndMissionId
          }
          this.setMyArguments(res)
          return res
        },
      },
    },

    mounted() {
      this.refreshMission()
    },

    methods: {
      refreshMission() {
        this.$apollo.queries.mission.refetch()
        this.$apollo.queries.executor.refetch()
      },

      setMyArguments(mission) {
        if (debug) console.debug('setMyArguments mission=', mission)
        const alreadySavedArgs = get(mission, 'argumentsByExecutorIdAndMissionTplIdAndMissionIdList') || []
        const parameters = get(mission, 'missionTplByExecutorIdAndMissionTplId.parametersByExecutorIdAndMissionTplIdList') || []

        if (debug) console.debug('alreadySavedArgs=', alreadySavedArgs)

        this.myArguments = map(parameters, p => {
          const arg = find(alreadySavedArgs, {paramName: p.paramName})
          const paramValue = arg && arg.paramValue || p.defaultValue
          // console.debug('FIND p.paramName=', p.paramName, 'arg=', arg, 'paramValue=', paramValue)
          return {
            paramName: p.paramName,
            type: p.type,
            paramValue,
            defaultValue: p.defaultValue,
            required: p.required,
            description: p.description,
          }
        })
      },

      validateParamValue(val) {
        // TODO proper validation
        // for now, just force to be a non-empty string
        if (debug) console.debug('validateParamValue val=', val)
        return !!val
      },

      parametersChanged() {
        return filter(this.myArguments, a => a.paramValue !== a.defaultValue)
      },

      saveArguments() {
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
                timeout: 600,
                type: 'info'
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
                if (debug) console.debug(arg.paramName, 'UPDATING', arg.paramName)
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
              if (debug) console.debug(arg.paramName, 'INSERTING', arg.paramName)
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
        const mutation = argumentInsert
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
        const mutation = argumentUpdate
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
        const mutation = argumentDelete
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
        return this.updateMission({description})
      },

      updateMissionStatus(missionStatus) {
        return this.updateMission({missionStatus})
      },

      updateMission(missionPatch) {
        return new Promise((resolve, reject) => {
          console.debug('updateMission missionPatch=', missionPatch)
          const mutation = missionUpdate
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
        if (this.executor.apiType !== 'REST0') {
          this.$q.notify('TODO runMission for apiType=' + this.executor.apiType)
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
          const data = reduce(parametersChanged, (obj, {paramName, paramValue, type}) => {
            obj[paramName] = convertValue(paramValue, type)
            return obj
          }, {})

          data.exercise_name = this.params.missionId
          data.missionTplId = this.params.missionTplId
          data.assetId = this.mission.assetId

          console.debug('data=', data)

          postMission(httpEndpoint, data)
            .then(res => {
              if (!res.status) {
                this.$q.notify("Executor reported no status")
                return
              }
              const status = res.status
              this.updateMissionStatus(status)
                .then(_ => {
                  this.$q.notify({
                    message: `Mission submitted. Status: ${status}`,
                    timeout: 2000,
                    type: 'info'
                  })
                  this.refreshMission()
                })
            })
            .catch(error => {
              this.$q.notify({
                message: `Mission submission error: ${JSON.stringify(error)}`,
                timeout: 0,
                closeBtn: true,
                type: 'info'
              })
              console.error('runMission: postMission: error=', error)
            })
        }
      },

      checkStatus() {
        getMission(this.executor.httpEndpoint, this.mission.missionId)
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
              type: 'info',
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
                closeBtn: true,
                type: 'info'
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
                closeBtn: true,
                type: 'info'
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
          cancel: true
        }).onOk(() => doIt())

        const doIt = () => {
          const mutation = missionDelete
          const variables = {
            input: {
              id: this.mission.id,
            }
          }
          this.$apollo.mutate({mutation, variables})
            .then((data) => {
              if (debug) console.debug('deleteMission: mutation data=', data)
              this.$router.replace(`/${encodeURIComponent(this.mission.executorId)}`)
              this.$q.notify('Done')
            })
            .catch((error) => {
              console.error('deleteMission: mutation error=', error)
            })
        }
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
