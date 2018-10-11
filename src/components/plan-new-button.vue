<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:60vw;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Add Plan
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-pa-lg">
          <q-field
            label="Plan ID:"
            :error="!planId.length"
            :label-width="4"
          >
            <q-input
              class="bg-light-blue-1"
              v-model.trim="planId"
              type="text"
              autofocus
              style="width:24em"
            />
          </q-field>

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
  import mutation from '../graphql/plansInsert.gql'
  import {Notify} from 'quasar'

  export default {
    data() {
      return {
        dialogOpened: false,
        planId: '',
        name: '',
        description: ''
      }
    },

    computed: {
      okToSubmit() {
        return this.planId && this.name
      }
    },

    methods: {
      openDialog() {
        this.planId = ''
        this.name = ''
        this.description = ''
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          planId: this.planId,
          name: this.name,
          description: this.description
        }

        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            Notify.create({
              message: 'Plan created',
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
