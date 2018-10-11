<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:400px;min-height:400px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Register new task for plan '{{planId}}'
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
            <q-input
              class="bg-light-blue-1"
              v-model.trim="executorId"
              type="text"
              autofocus
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Task Definition:"
            :error="!taskDefId.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="taskDefId"
              type="text"
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Asset:"
            :error="!assetId.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="assetId"
              type="text"
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Task Name:"
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
  import mutation from '../graphql/tasksInsert.gql'
  import {Notify} from 'quasar'

  const debug = true

  export default {
    props: {
      planId: {
        type: String,
        required: true
      }
    },

    data() {
      return {
        dialogOpened: false,
        executorId: '',
        taskDefId: '',
        assetId: '',
        name: '',
        description: '',
        arguments: [],
        startDate: null,
        endDate: null
      }
    },

    computed: {
      okToSubmit() {
        return this.taskDefId && this.assetId
      }
    },

    methods: {
      openDialog() {
        this.taskDefId = ''
        this.assetId = ''
        this.name = ''
        this.description = ''
        this.arguments = []
        this.startDate = new Date()
        this.endDate = new Date()
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          planId: this.planId,
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
    }
  }
</script>
