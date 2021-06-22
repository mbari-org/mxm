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
            ref="providerName"
            dense hide-bottom-space
            :error="!providerId.length || !!providerNameInvalid"
            :error-message="providerNameInvalid"
            @input="providerNameInvalid = null"
            class="bg-light-blue-1"
            v-model.trim="providerId"
            type="text"
            autofocus
            style="width:28em"
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
            style="width:28em"
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
  import providerBasicGql from '../graphql/providerBasic.gql'
  import providerInsertGql from '../graphql/providerInsert.gql'

  import apiTypeSelect from '../components/api-type-select'

  import get from 'lodash/get'
  import some from 'lodash/some'

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

      providerNameInvalid: null,
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
        this.providerNameInvalid = null
        this.progress = null
        this.progressLabel = null

        // some init for devel convenience:

        this.apiType = 'REST0'

        this.providerId = 'TethysDash@tethystest'
        this.httpEndpoint = 'http://tethystest.shore.mbari.org:8080/TethysDash/api/mxm'

        // this.providerId = 'TFT'
        // this.httpEndpoint = 'http://tsauv.shore.mbari.org/tft-mxm'
        // //     OR:
        // // this.httpEndpoint = 'http://localhost:8040'

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
          const graphQLErrors = get(error, 'graphQLErrors') || []
          const duplicateKey = some(graphQLErrors, e =>
            e.message && e.message.match(/.*duplicate key.*/)
          )
          if (duplicateKey) {
            this.providerNameInvalid = 'Provider name already registered'
            this.$refs.providerName.focus()
          }
          else {
            console.error('mutation error=', JSON.stringify(error))
            this.$q.notify({
              message: `Unexpected error. See dev console.`,
              timeout: 0,
              closeBtn: 'Close',
              color: 'warn'
            })
          }
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
