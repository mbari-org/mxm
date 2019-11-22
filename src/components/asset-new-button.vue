<template>
  <div>
    <q-btn
      color="primary"
      icon="add"
      dense round no-caps size="sm"
      @click="openDialog"
    >
      <q-tooltip>
        Register new asset of class '{{assetClassName}}' (for '{{executorId}}')
      </q-tooltip>
    </q-btn>

    <utl-dialog
      :dialog-opened="dialogOpened"
      :title="`Register new asset of class '${assetClassName}' (for '${executorId}')`"
      :ok-to-submit="!!okToSubmit"
      :ok-to-dismiss="!!okToDismiss"
      @submit="submit"
      @dialogClosing="dialogOpened = false"
    >
      <div
        class="column q-gutter-sm"
      >
        <div>
          Asset ID:
          <q-input
            dense hide-bottom-space
            :error="!assetId.length"
            class="bg-light-blue-1"
            v-model.trim="assetId"
            type="text"
            autofocus
            style="width:24em"
          />
        </div>

        <div>
          Description:
          <mxm-markdown
            expandable
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
  import assetInsert from '../graphql/assetInsert.gql'

  export default {
    props: {
      executorId: {
        type: String,
        required: true
      },

      assetClassName: {
        type: String,
        required: true
      }
    },

    data: () => ({
      dialogOpened: false,
      assetId: '',
      description: null,
    }),

    computed: {
      okToSubmit() {
        return this.assetId
      },

      okToDismiss() {
        return true // TODO
      },
    },

    methods: {
      openDialog() {
        this.assetId = ''
        this.description = null
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          executorId:  this.executorId,
          className: this.assetClassName,
          assetId: this.assetId,
          description: this.description || null
        }

        const mutation = assetInsert
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            this.$q.notify({
              message: 'Asset registered',
              timeout: 1000,
              color: 'info',
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
