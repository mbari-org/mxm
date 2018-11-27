<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Executors" to="/executors"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/executors/${encodeURIComponent(params.executorId)}`"/>
      <q-breadcrumbs-el label="Missions" :to="`/executors/${encodeURIComponent(params.executorId)}/missions`"/>
      <q-breadcrumbs-el :label="params.missionId"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshMission"
      />
    </q-breadcrumbs>

    <div v-if="mission">

      <q-card class="q-mb-md">
        <q-card-title>
          Mission: <span class="text-bold">{{ mission.missionId }}</span>
          <span class="q-ml-lg">
            <router-link
              :to="`/executors/${encodeURIComponent(mission.executorId)}/missiondefs/${encodeURIComponent(mission.missionDefId)}`"
              style="color:gray; font-size:smaller; text-decoration:none"
            >
              ({{ mission.missionDefId }})
              <q-tooltip>Mission Definition</q-tooltip>
            </router-link>
          </span>
        </q-card-title>
        <q-card-separator/>
        <q-card-main>
          <table class="mission-table">
            <tbody>
            <tr>
              <td>Description:</td>
              <td>
                <description :text="mission.description" />
                <q-popup-edit
                  v-model="mission.description"
                  title="Description"
                  buttons
                  @save="updateDescription"
                >
                  <q-field>
                    <q-input
                      v-model.trim="mission.description"
                      clearable
                      class="bg-green-1"
                      type="textarea"
                      rows="3"
                      :max-height="300"
                    />
                  </q-field>
                </q-popup-edit>

              </td>
            </tr>
            <tr>
              <td>Asset:</td>
              <td>
                {{ mission.assetId }}
                <span class="q-ml-lg">
                  <router-link
                    :to="`/executors/${encodeURIComponent(params.executorId)}/assetclasses/${encodeURIComponent(mission.assetByExecutorIdAndAssetId.className)}`"
                    style="color:gray; font-size:small; text-decoration:none"
                  >
                    ({{ mission.assetByExecutorIdAndAssetId.className }})
                    <q-tooltip>Asset Class</q-tooltip>
                  </router-link>
                </span>
              </td>
            </tr>
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
        </q-card-main>
      </q-card>

      <q-table
        :data="myArguments"
        :columns="argColumns"
        row-key="name"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
      >
        <div slot="top-left" slot-scope="props" class="row items-center">
          <div class="col-auto q-headline">
            Arguments
          </div>

          <div class="q-ml-md row">
            <q-search
              v-if="myArguments"
              class="col"
              color="secondary"
              v-model="filter"
              placeholder="Filter"
              clearable
            />
          </div>
        </div>

        <div slot="top-right" slot-scope="props">
          <div class="q-ml-md row">
            <q-btn
              class="col-auto"
              dense size="sm"
              icon="save"
              color="primary"
              no-wrap no-caps
              :disable="savingArgs"
              :loading="savingArgs"
              @click="saveArguments"
            >
              <q-tooltip>Save changes in arguments</q-tooltip>
            </q-btn>
            <div style="color:gray;font-size:small" class="col-auto vertical-middle text-weight-light q-ml-sm">
              Overridden parameters: {{parametersChanged().length}}
            </div>
          </div>
        </div>

        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td key="paramName" :props="props"
                style="width:5px;font-family:monospace"
          >
            <router-link
              style="text-decoration:none"
              :to="`/executors/${encodeURIComponent(mission.executorId)}/MissionDefs/${encodeURIComponent(mission.missionDefId)}/params/${encodeURIComponent(props.row.paramName)}`"
            >{{ props.row.paramName }}
            </router-link>
          </q-td>

          <q-td key="paramValue" :props="props"
                style="width:5px"
          >
            <div :class="'round-borders q-pa-xs ' +
                  (props.row.paramValue !== props.row.defaultValue ? 'bg-green-11 text-bold' : 'bg-green-1')">
              {{ props.row.paramValue }}
            </div>

            <q-popup-edit
              v-model="props.row.paramValue"
              :title="`${props.row.paramName}`"
              buttons
              :validate="validateParamValue"
            >
              <q-field>
                <q-input
                  v-model.trim="props.row.paramValue"
                  clearable
                  :clear-value="props.row.defaultValue"
                  :error="!props.row.paramValue"
                />
              </q-field>
            </q-popup-edit>
          </q-td>

          <q-td key="type" :props="props"
                style="width:5px"
          >
            {{ props.row.type }}
          </q-td>

          <q-td key="description" :props="props"
          >
            {{ props.row.description }}
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
  import mission from '../graphql/mission.gql'
  import Vue from 'vue'
  import description from '../components/description'
  import argumentInsert from '../graphql/argumentInsert.gql'
  import argumentUpdate from '../graphql/argumentUpdate.gql'
  import argumentDelete from '../graphql/argumentDelete.gql'
  import missionUpdate from '../graphql/missionUpdate.gql'
  import {Notify} from 'quasar'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      description,
    },

    data() {
      return {
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
      mission: {
        query: mission,
        variables() {
          return {
            missionId: this.params.missionId,
          }
        },
        update(data) {
          let res = null
          if (debug) console.debug('update: data=', data)
          if (data.missionByMissionId) {
            res = data.missionByMissionId
          }
          Vue.nextTick(() => {
            this.setMyArguments(res)
          })
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
      },

      setMyArguments(mission) {
        if (debug) console.debug('setMyArguments mission=', mission)
        const alreadySavedArgs = _.get(mission, 'argumentsByMissionIdList') || []
        const parameters = _.get(mission, 'missionDefByExecutorIdAndMissionDefId.parametersByExecutorIdAndMissionDefIdList') || []

        if (debug) console.debug('alreadySavedArgs=', alreadySavedArgs)

        this.myArguments = _.map(parameters, p => {
          const arg = _.find(alreadySavedArgs, {paramName: p.paramName})
          const paramValue = arg && arg.paramValue || p.defaultValue
          // console.debug('FIND p.paramName=', p.paramName, 'arg=', arg, 'paramValue=', paramValue)
          return {
            paramName: p.paramName,
            type: p.type,
            paramValue,
            defaultValue: p.defaultValue,
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
        return _.filter(this.myArguments, a => a.paramValue !== a.defaultValue)
      },

      saveArguments() {
        if (this.savingArgs) {
          return
        }
        this.savingArgs = true

        const alreadySavedArgs = _.get(this.mission, 'argumentsByMissionIdList') || []
        if (debug) console.debug('saveArguments: alreadySavedArgs=', alreadySavedArgs)

        let numInserted = 0
        let numUpdated = 0
        let numDeleted = 0

        const argList = _.clone(this.myArguments)
        const nextArg = () => {
          const arg = argList.pop()
          if (!arg) {
            if (debug) console.debug('saveArguments DONE: numInserted=', numInserted,
              'numUpdated=', numUpdated, 'numDeleted=', numDeleted)

            let message;
            if (numInserted || numUpdated || numDeleted) {
              message = `Arguments updated`
              this.refreshMission()
            }
            else {
              message = `No changed arguments`
            }
            Notify.create({
              message,
              timeout: 1000,
              type: 'info'
            })
            this.savingArgs = false
            return
          }

          if (debug) console.debug('saveArguments: checking', arg.paramName,
            'v=', arg.paramValue, 'dv=', arg.defaultValue)

          const alreadySavedArg = _.find(alreadySavedArgs, x => x.paramName === arg.paramName)
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
          missionDefId: this.mission.missionDefId,
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

      updateDescription(val) {
        console.debug('updateDescription val=', val)
        const mutation = missionUpdate
        const variables = {
          input: {
            id: this.mission.id,
            missionPatch: {
              description: val
            }
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateDescription: mutation data=', data)
            this.mission.description = val
          })
          .catch((error) => {
            console.error('updateDescription: mutation error=', error)
          })
      },
    },

    watch: {
      '$route'() {
        this.refreshMission()
      }
    }
  }
</script>
