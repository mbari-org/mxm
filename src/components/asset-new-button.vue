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
      v-on:submit="submit"
      v-on:dialogClosing="dialogOpened = false"
    >
      <div
        class="column q-gutter-sm"
      >
        <q-input
          label="Asset ID:"
          :error="!assetId.length"
          :label-width="4"
          class="bg-light-blue-1"
          v-model.trim="assetId"
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

    data() {
      return {
        dialogOpened: false,
        assetId: '',
        description: ''
      }
    },

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
        this.description = ''
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
