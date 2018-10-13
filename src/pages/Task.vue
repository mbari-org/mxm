<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Tasks"/>
      <q-breadcrumbs-el :label="params.taskId"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshTask"
      />
    </q-breadcrumbs>

    <div v-if="task">

      <!--<pre>task={{task}}</pre>-->

      <q-card class="q-mb-md">
        <q-card-title>
          Task: '{{ task.taskId }}'
        </q-card-title>
        <q-card-separator/>
        <q-card-main>
          <table>
            <tbody>
            <tr>
              <td>Task Name:</td>
              <td>{{ task.name }}</td>
            </tr>
            <tr>
              <td>Description:</td>
              <td>
                <p class="text-italic">
                  {{ task.description }}
                </p>
              </td>
            </tr>
            <tr>
              <td>Task Def:</td>
              <td>
                <router-link :to="`/executors/${encodeURIComponent(task.executorId)}/taskdefs/${encodeURIComponent(task.taskDefId)}`">
                  {{ task.taskDefId }}
                </router-link>
              </td>
            </tr>
            <tr>
              <td>Executor:</td>
              <td>
                <router-link :to="`/executors/${encodeURIComponent(task.executorId)}`">
                  {{ task.executorId }}
                </router-link>
              </td>
            </tr>
            <tr>
              <td>Asset:</td>
              <td>{{ task.assetId }}</td>
            </tr>
            <tr v-if="task.start">
              <td>Start:</td>
              <td>{{ task.start }}</td>
            </tr>
            <tr v-if="task.end">
              <td>End:</td>
              <td>{{ task.end }}</td>
            </tr>
            </tbody>
          </table>
        </q-card-main>
      </q-card>

      <q-table
        :data="myArguments"
        :columns="argColumns"
        row-key="paramName"
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
            />
            <div style="color:gray;font-size:small" class="col-auto vertical-middle text-weight-light q-ml-sm">
              Overridden parameters: {{parametersChanged().length}}
            </div>
          </div>
        </div>

        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td key="paramName" :props="props"
                style="width:5px"
          >
            <div class="text-bold">
              {{ props.row.paramName }}
            </div>
          </q-td>

          <q-td key="paramValue" :props="props"
                style="width:5px"
          >
            <div :class="'round-borders q-pa-xs ' +
                  (props.row.paramValue !== props.row.defaultValue ? 'bg-green-11 text-bold' : 'bg-green-1')">
              {{ props.row.paramValue }}
              <q-tooltip>Click to edit</q-tooltip>
            </div>

            <q-popup-edit
              v-model="props.row.paramValue"
              :title="`${props.row.paramName}`"
              buttons
              :validate="validateValue"
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
      Task not found: '{{params.taskId}}'
    </div>
  </q-page>
</template>

<script>
  import task from '../graphql/task.gql'
  import Vue from 'vue'
  import argumentInsert from '../graphql/argumentInsert.gql'
  import argumentUpdate from '../graphql/argumentUpdate.gql'
  import argumentDelete from '../graphql/argumentDelete.gql'
  import {Notify} from 'quasar'
  import _ from 'lodash'

  const debug = false

  export default {
    data() {
      return {
        loading: false,
        task: null,
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
      task: {
        query: task,
        variables() {
          return {
            taskId: this.params.taskId,
          }
        },
        update(data) {
          let res = null
          if (debug) console.debug('update: data=', data)
          if (data.taskByTaskId) {
            res = data.taskByTaskId
          }
          Vue.nextTick(() => {
            this.setMyArguments(res)
          })
          return res
        },
      },
    },

    mounted() {
      this.refreshTask()
    },

    methods: {
      refreshTask() {
        this.$apollo.queries.task.refetch()
      },

      setMyArguments(task) {
        if (debug) console.debug('setMyArguments task=', task)
        const alreadySavedArgs = _.get(task, 'argumentsByTaskIdList') || []
        const parameters = _.get(task, 'taskDefByExecutorIdAndTaskDefId.parametersByExecutorIdAndTaskDefIdList') || []

        if (debug) console.debug('alreadySavedArgs=', alreadySavedArgs)

        this.myArguments = _.map(parameters, p => {
          const arg = _.find(alreadySavedArgs, {paramName: p.name})
          const paramValue = arg && arg.paramValue || p.defaultValue
          // console.debug('FIND p.name=', p.name, 'arg=', arg, 'paramValue=', paramValue)
          return {
            paramName: p.name,
            type: p.type,
            paramValue,
            defaultValue: p.defaultValue,
            description: p.description,
          }
        })
      },

      validateValue(val) {
        // TODO proper validation
        // for now, just force to be a non-empty string
        if (debug) console.debug('validateValue val=', val)
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

        const alreadySavedArgs = _.get(this.task, 'argumentsByTaskIdList') || []
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
              this.refreshTask()
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

          const alreadySavedArg = _.find(alreadySavedArgs, x => x.paramName == arg.paramName)
          if (debug) console.debug(arg.paramName, 'alreadySavedArg=', alreadySavedArg)

          if (arg.paramValue !== arg.defaultValue) {
            if (alreadySavedArg) {
              if (alreadySavedArg.paramValue !== arg.paramValue) {
                if (debug) console.debug(arg.paramName, 'UPDATING', arg.paramName)
                this.updateArgument(alreadySavedArg.nodeId, arg.paramValue, ok => {
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
              this.deleteArgument(alreadySavedArg.nodeId, ok => {
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
          taskId: this.params.taskId,
          executorId: this.task.executorId,
          taskDefId: this.task.taskDefId,
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

      updateArgument(nodeId, paramValue, next) {
        const mutation = argumentUpdate
        const variables = {
          input: {
            nodeId,
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

      deleteArgument(nodeId, next) {
        const mutation = argumentDelete
        const variables = {
          input: {
            nodeId
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
    },

    watch: {
      '$route'() {
        this.refreshTask()
      }
    }
  }
</script>
