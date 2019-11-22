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
      @submit="submit"
      @dialogClosing="dialogOpened = false"
    >
      <div
        class="column q-gutter-sm"
      >
        <div>
          Class name:
          <q-input
            dense hide-bottom-space
            :error="!className.length"
            class="bg-light-blue-1"
            v-model.trim="className"
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
  import assetClassInsert from '../graphql/assetClassInsert.gql'

  export default {
    props: {
      executorId: {
        type: String,
        required: true
      },
    },

    data: () => ({
      dialogOpened: false,
      className: '',
      description: null
    }),

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
        this.description = null
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
