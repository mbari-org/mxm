<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:600px;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Add Parameter
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">
          <q-field
            label="Name:"
            :error="!paramName.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="paramName"
              type="text"
              autofocus
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Type:"
            :error="!type.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="type"
              type="text"
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Default Value:"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="defaultValue"
              type="text"
              style="width:24em"
            />
          </q-field>

          <q-field
            label="Required?"
            :label-width="4"
            :warning="required"
          >
            <q-checkbox
              v-model="required"
              :left-label="true"
            />
          </q-field>

          <q-field
            label="Description:"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="description"
              type="textarea"
              rows="3"
              :max-height="300"
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
  import parameterInsert from '../graphql/parameterInsert.gql'
  import {Notify} from 'quasar'

  const debug = false

  export default {
    props: {
      executorId: {
        type: String,
        required: true
      },
      missionDefId: {
        type: String,
        required: true
      }
    },

    data() {
      return {
        dialogOpened: false,
        paramName: '',
        type: '',
        required: true,
        defaultValue: '',
        description: ''
      }
    },

    computed: {
      okToSubmit() {
        return this.paramName && this.type
      }
    },

    methods: {
      openDialog() {
        this.paramName = ''
        this.type = ''
        this.required = true
        this.defaultValue = null
        this.description = null
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          executorId: this.executorId,
          missionDefId: this.missionDefId,
          paramName: this.paramName,
          type: this.type,
          required: this.required,
          defaultValue: this.defaultValue,
          description: this.description,
        }
        if (debug) console.debug('variables=', variables)

        const mutation = parameterInsert
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            Notify.create({
              message: 'Parameter created',
              timeout: 1000,
              type: 'info'
            })
            this.$emit('created', variables)
          })
          .catch((error) => {
            console.error('mutation error=', error)
          })
      },
    }
  }
</script>
