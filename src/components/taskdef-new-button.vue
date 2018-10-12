<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:300px;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Register new task definition for '{{executorId}}'
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">
          <q-field
            label="Task Definition ID:"
            :error="!taskDefId.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="taskDefId"
              type="text"
              autofocus
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Description:"
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
  import mutation from '../graphql/taskDefsInsert.gql'
  import {Notify} from 'quasar'

  const debug = true

  export default {
    props: {
      executorId: {
        type: String,
        required: true
      }
    },

    data() {
      return {
        dialogOpened: false,
        taskDefId: '',
        description: ''
      }
    },

    computed: {
      okToSubmit() {
        return this.taskDefId
      }
    },

    methods: {
      openDialog() {
        this.taskDefId = ''
        this.description = ''
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          executorId: this.executorId,
          taskDefId: this.taskDefId,
          description: this.description,
        }
        if (debug) console.debug('variables=', variables)

        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            Notify.create({
              message: 'Task definition created',
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
