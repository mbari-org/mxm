<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:600px;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Register new executor
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">
          <q-field
            label="Executor name:"
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

          <q-field
            label="HTTP Endpoint:"
            :error="!httpEndpoint.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="httpEndpoint"
              type="text"
              style="width:24em"
            />
          </q-field>

          <q-field
            label="API Type:"
            :error="!apiType.length"
            :label-width="4"
          >
            <api-type-select
              :value="apiType"
              @change="val => { apiType = val }"
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
  import executorInsert from '../graphql/executorInsert.gql'
  import missionDefInsert from '../graphql/missionDefInsert.gql'
  import apiTypeSelect from '../components/api-type-select'
  import { getMissionDefs } from 'plugins/rest0'
  import {Notify} from 'quasar'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      apiTypeSelect,
    },

    data() {
      return {
        dialogOpened: false,
        executorId: '',
        httpEndpoint: '',
        apiType: '',
        description: ''
      }
    },

    computed: {
      okToSubmit() {
        return this.executorId && this.httpEndpoint && this.apiType
      }
    },

    methods: {
      openDialog() {
        this.executorId = ''
        this.httpEndpoint = ''
        this.apiType = ''
        this.description = null
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          input: {
            executor: {
              executorId: this.executorId,
              httpEndpoint: this.httpEndpoint,
              apiType: this.apiType,
              description: this.description
            }
          }
        }

        const mutation = executorInsert
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('mutation data=', data)
            this.executorCreated(variables.input.executor, data)
          })
          .catch((error) => {
            console.error('mutation error=', error)
          })
      },

      executorCreated(executor, data) {
        if (executor.apiType === 'REST0') {
          getMissionDefs(executor.httpEndpoint)
            .then(missionDefs => {
              this.createMissionDefs(executor, missionDefs)
            })

          // TODO other entities (assetClasses, assets, ...)
        }
        else {
          this.closeDialogAndNotify(executor)
        }
      },

      createMissionDefs(executor, missionDefs) {
        console.debug('missionDefs=', missionDefs)
        _.each(missionDefs, missionDef => {
          this.createMissionDef(executor, missionDef)
        })
        // TODO do the following after the promises
        this.closeDialogAndNotify(executor)
      },

      createMissionDef(executor, missionDef) {
        const variables = {
          executorId: executor.executorId,
          missionDefId: missionDef.missionDefId,
          description: missionDef.description,
        }
        if (debug) console.debug('createMissionDef: variables=', variables)

        const mutation = missionDefInsert
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
          })
          .catch((error) => {
            console.error('mutation error=', error)
          })
      },

      closeDialogAndNotify(executor) {
        this.dialogOpened = false
        Notify.create({
          message: `Executor created: ${executor.executorId}`,
          timeout: 1000,
          type: 'info'
        })
        this.$emit('created', executor)
      },
    }
  }
</script>
