<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:350px;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Register new asset class
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">
          <q-field
            label="Class name:"
            :error="!className.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="className"
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
    >
      <q-tooltip>Register a new asset class</q-tooltip>
    </q-btn>

  </div>
</template>

<script>
  import mutation from '../graphql/assetClassesInsert.gql'
  import {Notify} from 'quasar'

  export default {
    data() {
      return {
        dialogOpened: false,
        className: '',
        description: ''
      }
    },

    computed: {
      okToSubmit() {
        return this.className
      }
    },

    methods: {
      openDialog() {
        this.className = ''
        this.description = ''
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          className: this.className,
          description: this.description || null
        }

        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            Notify.create({
              message: 'Asset class registered',
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
