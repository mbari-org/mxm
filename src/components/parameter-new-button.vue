<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:300px;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Add parameter
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
            :error="!name.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="name"
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
  import mutation from '../graphql/parameters_insert.gql'
  import {Notify} from 'quasar'

  export default {
    props: {
      executorId: {
        type: String,
        required: true
      },
      taskdefId: {
        type: String,
        required: true
      }
    },

    data() {
      return {
        dialogOpened: false,
        name: '',
        type: '',
        required: true,
        defaultValue: '',
        description: ''
      }
    },

    computed: {
      okToSubmit() {
        return this.name && this.type
      }
    },

    methods: {
      openDialog() {
        this.name = ''
        this.type = ''
        this.required = true
        this.defaultValue = null
        this.description = null
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          name: this.name,
          type: this.type,
          required: this.required,
          defaultValue: this.defaultValue,
          description: this.description,
        }

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
