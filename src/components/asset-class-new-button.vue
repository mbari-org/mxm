<template>
  <div>
    <q-btn
      color="primary"
      icon="add"
      dense round no-caps size="sm"
      @click="openDialog"
    >
      <q-tooltip>Register a new asset class</q-tooltip>
    </q-btn>

    <utl-dialog
      :dialog-opened="dialogOpened"
      :title="`Register new asset class (for '${executorId}')`"
      :ok-to-submit="!!okToSubmit"
      :ok-to-dismiss="!!okToDismiss"
      v-on:submit="submit"
      v-on:dialogClosing="dialogOpened = false"
    >
      <div
        class="column q-gutter-sm"
      >
        <q-input
          label="Class name:"
          :error="!className.length"
          :label-width="4"
          class="bg-light-blue-1"
          v-model.trim="className"
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
  import assetClassInsert from '../graphql/assetClassInsert.gql'

  export default {
    props: {
      executorId: {
        type: String,
        required: true
      },
    },

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
      },

      okToDismiss() {
        return !this.className && !this.description
      },
    },

    methods: {
      openDialog() {
        this.className = ''
        this.description = ''
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          executorId: this.executorId,
          className: this.className,
          description: this.description || null
        }

        const mutation = assetClassInsert
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            console.log('mutation data=', data)
            this.dialogOpened = false
            this.$q.notify({
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
