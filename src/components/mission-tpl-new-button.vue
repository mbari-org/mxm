<template>
  <div>
    <q-dialog v-model="dialogOpened"
             no-backdrop-dismiss
    >
      <q-layout style="min-width:300px;min-height:300px">
        <q-header>
          <q-toolbar-title>
            Register new mission template for '{{executorId}}'
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-header>

        <div class="q-pa-lg">
          <q-input
            label="Mission Template ID:"
            :error="!missionTplId.length"
            :label-width="4"
            class="bg-light-blue-1"
            v-model.trim="missionTplId"
            type="text"
            autofocus
            style="width:24em"
          />

          <q-input
            label="Description:"
            :label-width="4"
            class="bg-light-blue-1"
            v-model.trim="description"
            type="text"
            style="width:24em"
          />

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
      </q-layout>
    </q-dialog>

    <q-btn
      color="primary"
      icon="add"
      dense round no-caps size="sm"
      @click="openDialog"
    />

  </div>
</template>

<script>
  import missionTplInsert from '../graphql/missionTplInsert.gql'

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
        missionTplId: '',
        description: ''
      }
    },

    computed: {
      okToSubmit() {
        return this.missionTplId
      }
    },

    methods: {
      openDialog() {
        this.missionTplId = ''
        this.description = ''
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          executorId: this.executorId,
          missionTplId: this.missionTplId,
          description: this.description,
        }
        if (debug) console.debug('variables=', variables)

        const mutation = missionTplInsert
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            this.$q.notify({
              message: 'Mission Template created',
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
