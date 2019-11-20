<template>
  <div>
    <q-btn
      color="primary"
      icon="add"
      dense round no-caps size="sm"
      @click="openDialog"
    />

    <utl-dialog
      :dialog-opened="dialogOpened"
      :title="`Register new mission template for '${executorId}'`"
      :ok-to-submit="!!okToSubmit"
      :ok-to-dismiss="!!okToDismiss"
      @submit="submit"
      @dialogClosing="dialogOpened = false"
    >
      <div
        class="column q-gutter-sm"
      >
        <div>
          Mission Template ID:
          <q-input
            dense hide-bottom-space
            :error="!missionTplId.length"
            :label-width="4"
            class="bg-light-blue-1"
            v-model.trim="missionTplId"
            type="text"
            autofocus
            style="width:24em"
          />
        </div>

        <div>
          Description:
          <mxm-markdown
            class="bg-light-blue-1"
            style="min-height:4em;min-width:24em"
            :text="description"
            editable edit-click
            @saveDescription="d => { description = d }"
          />
        </div>

      </div>
    </utl-dialog>
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
      },

      okToDismiss() {
        return true // TODO
      },
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
              color: 'info',
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
