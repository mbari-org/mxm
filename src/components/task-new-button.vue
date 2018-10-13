<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:400px;min-height:400px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Register new task
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">
          <q-field
            label="Executor:"
            :error="!executorId.length"
            :label-width="4"
          >
            <executor-select
              v-model="executorId"
            />
          </q-field>

          <q-field
            label="Task Definition:"
            :error="!taskDefId.length"
            :label-width="4"
          >
            <task-def-select
              :task-defs="taskDefs"
              v-model="taskDefId"
            />
          </q-field>

          <q-field
            label="Asset:"
            :error="!assetId.length"
            :label-width="4"
          >
            <asset-select
              :asset-classes="assetClasses"
              v-model="assetId"
            />
          </q-field>

          <q-field
            label="Task ID:"
            :error="!taskId.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="taskId"
              type="text"
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Task Name:"
            :error="!name.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="name"
              type="text"
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Task Description:"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="description"
              type="text"
              style="width:24em"
            />
          </q-field>

        </div>

        <q-toolbar slot="footer" color="flat">
          <q-toolbar-title/>
          <q-btn dense
                 :color="okToSubmit ? 'primary' : 'light'"
                 @click="submit"
                 label="Submit"
                 :disable="!okToSubmit"
          />
        </q-toolbar>
      </q-modal-layout>
    </q-modal>

    <q-btn
      color="primary"
      icon="add"
      dense round no-caps size="sm"
      @click="openDialog"
    />

  </div>
</template>

<script>
  import executor from '../graphql/executor.gql'
  import mutation from '../graphql/tasksInsert.gql'
  import ExecutorSelect from 'components/executor-select'
  import TaskDefSelect from 'components/task-def-select'
  import AssetSelect from 'components/asset-select'
  import _ from 'lodash'
  import {Notify} from 'quasar'


  const debug = true

  export default {
    components: {
      ExecutorSelect,
      TaskDefSelect,
      AssetSelect,
    },

    data() {
      return {
        dialogOpened: false,
        executor: null,
        executorId: '',
        taskDefId: '',
        assetId: '',
        taskId: '',
        name: '',
        description: '',
        arguments: [],
        startDate: null,
        endDate: null
      }
    },

    computed: {
      taskDefs() {
        const list = this.executor && this.executor.taskDefsByExecutorIdList || []
        return list
      },

      assetClasses() {
        const list = []
        const taskDefs = this.executor && this.executor.taskDefsByExecutorIdList || []
        if (taskDefs.length) {
          _.each(taskDefs, td => {
            const classes = td.taskdefAssetClassesByExecutorIdAndTaskDefIdList || []
            _.each(classes, c => {
              list.push(c)
            })
          })
        }
        return list
      },

      okToSubmit() {
        return this.executorId
          && this.taskDefId
          && this.assetId
          && this.taskId
          && this.name
      }
    },

    apollo: {
      executor: {
        query: executor,
        variables() {
          return {
            executorId: this.executorId,
          }
        },
        update(data) {
          if (debug) console.log('task-new-button update: data=', data)
          if (data.allExecutorsList && data.allExecutorsList.length) {
            return data.allExecutorsList[0]
          }
          else return null
        },
      },
    },

    methods: {
      openDialog() {
        this.executor = null
        this.executorId = ''
        this.taskDefId = ''
        this.assetId = ''
        this.taskId = ''
        this.name = ''
        this.description = ''
        this.arguments = []
        this.startDate = new Date()
        this.endDate = new Date()
        this.dialogOpened = true
        this.$apollo.queries.executor.refetch()
      },

      submit() {
        const variables = {
          taskId: this.taskId,
          executorId: this.executorId,
          taskDefId: this.taskDefId,
          assetId: this.assetId,
          name: this.name,
          description: this.description
        }
        if (this.startDate) {
          variables.start = this.startDate.toISOString()
        }
        if (this.endDate) {
          variables.end = this.endDate.toISOString()
        }
        // TODO geometry
        if (this.geometry) {
          variables.geometry = this.geometry
        }
        if (debug) console.debug('variables=', variables)

        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            Notify.create({
              message: 'Task created',
              timeout: 1000,
              type: 'info'
            })
            this.$emit('created', variables)
          })
          .catch((error) => {
            console.error('mutation error=', error)
          })
      }
    },

    watch: {
      executorId(val) {
        if (debug) console.log('watch executorId=', val)
        this.$apollo.queries.executor.refetch()
      },

      assetClasses(val) {
        if (debug) console.log('watch assetClasses=', val)
      },
    }
  }
</script>
