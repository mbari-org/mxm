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
      title="Register new provider"
      :ok-to-submit="!!okToSubmit && !progress"
      :ok-to-dismiss="!!okToDismiss && !progress"
      @submit="submit"
      @dialogClosing="dialogOpened = false"
    >
      <div
        class="column q-gutter-sm"
      >
        <div>
          Provider name:
          <q-input
            dense hide-bottom-space
            :error="!providerId.length"
            class="bg-light-blue-1"
            v-model.trim="providerId"
            type="text"
            autofocus
            style="width:24em"
          />
        </div>

        <div>
          HTTP Endpoint:
          <q-input
            dense hide-bottom-space
            :error="!httpEndpoint.length"
            class="bg-light-blue-1"
            v-model.trim="httpEndpoint"
            type="text"
            style="width:24em"
          />
        </div>

        <div>
          API Type:
          <api-type-select
            :value="apiType"
            @input="val => { apiType = val.value }"
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

        <div>
          <q-linear-progress
            v-if="progress" size="25px" :value="progress" color="accent"
          >
            <div class="absolute-full flex flex-center">
              <q-badge color="white" text-color="accent" :label="progressLabel" />
            </div>
          </q-linear-progress>
        </div>
      </div>
    </utl-dialog>
  </div>
</template>

<script>
  import providerInsertGql from '../graphql/providerInsert.gql'

  import apiTypeSelect from '../components/api-type-select'

  const debug = false

  export default {
    components: {
      apiTypeSelect,
    },

    data: () => ({
      dialogOpened: false,
      providerId: '',
      httpEndpoint: '',
      apiType: '',
      description: null,

      progress: null,
      progressLabel: null,
    }),

    computed: {
      okToSubmit() {
        return this.providerId && this.httpEndpoint && this.apiType
      },

      okToDismiss() {
        return !this.providerId
      },
    },

    methods: {
      openDialog() {
        this.apiType = 'REST0'

        this.providerId = 'TethysDash'
        this.httpEndpoint = 'http://tethyssim.shore.mbari.org:8080/TethysDash/api/mxm'
        this.description = 'TethysDash/LRAUV System'

        // this.providerId = 'TFT'
        // this.httpEndpoint = 'http://localhost:8040'
        //     OR:
        // this.httpEndpoint = 'http://tsauv.shore.mbari.org/tft-mxm'
        // this.description = 'TSAUV Front Tracking'

        this.dialogOpened = true
      },

      async submit() {
        const mutation = providerInsertGql
        const variables = {
          input: {
            provider: {
              providerId: this.providerId,
              httpEndpoint: this.httpEndpoint,
              apiType: this.apiType,
              description: this.description,
            }
          }
        }

        this.$q.loading.show({
          message: 'Provider registration in progress...'
        })

        try {
          const data = await this.$apollo.mutate({mutation, variables})
          this.$q.loading.hide()
          if (debug) console.debug('mutation data=', data)
          this.closeDialogAndNotify(variables.input.provider)
        }
        catch(error) {
          this.$q.loading.hide()
          console.error('mutation error=', error)
        }
      },

      closeDialogAndNotify(provider) {
        this.progress = null
        this.progressLabel = null
        this.dialogOpened = false
        this.$q.notify({
          message: `Provider created: ${provider.providerId}`,
          timeout: 1000,
          position: 'top',
          color: 'info',
        })
        this.$emit('created', provider)
      },
    }
  }
</script>
