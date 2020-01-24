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
  import assetClassInsertGql from '../graphql/assetClassInsert.gql'
  import assetInsertGql from '../graphql/assetInsert.gql'
  import unitInsertGql from '../graphql/unitInsert.gql'
  import missionTplInsertGql from '../graphql/missionTplInsert.gql'
  import missionTplAssetClassInsertGql from '../graphql/missionTplAssetClassInsert.gql'
  import parameterInsertGql from '../graphql/parameterInsert.gql'

  import apiTypeSelect from '../components/api-type-select'

  import map from 'lodash/map'
  import orderBy from 'lodash/orderBy'

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

      submit() {
        const mxmProviderClient = this.$createMxmProvideClient({
          httpEndpoint: this.httpEndpoint,
          apiType: this.apiType,
        })

        if (mxmProviderClient.isSupportedInterface()) {
          // TODO progress is very ad hoc at the moment.
          this.progress = 0

          mxmProviderClient.getCapabilities()
              .then(capabilities => {
                this.progress += 0.1
                this.createProviderAndEntities(mxmProviderClient, capabilities)
              })
              .catch(error => {
                console.error('getCapabilities: error=', error)
              })
        }
        else {
          this.createProviderAndEntities(mxmProviderClient)
        }
      },

      createProviderAndEntities(mxmProviderClient, capabilities = {}) {
        const variables = {
          input: {
            provider: {
              providerId: this.providerId,
              httpEndpoint: this.httpEndpoint,
              apiType: this.apiType,
              description: this.description,
              usesSched: capabilities.usesSched,
              canValidate: capabilities.canValidate,
              usesUnits: capabilities.usesUnits,
              descriptionFormat: capabilities.descriptionFormat,
            }
          }
        }

        const mutation = providerInsertGql
        this.$apollo.mutate({mutation, variables})
            .then(data => {
              if (debug) console.debug('mutation data=', data)
              if (mxmProviderClient.isSupportedInterface()) {
                this.createOtherEntities(mxmProviderClient, variables.input.provider, data)
              }
              else {
                this.closeDialogAndNotify(variables.input.provider)
              }
            })
            .catch(error => {
              console.error('mutation error=', error)
            })
      },

      createOtherEntities(mxmProviderClient, provider, data) {
        const getAndCreateAssetClasses = () => {
          this.progress += 0.1
          this.progressLabel = 'Importing asset classes...'
          mxmProviderClient.getAssetClasses()
              .then(assetClasses => {
                this.progress += 0.1
                this.createAssetClasses(provider, assetClasses)
                    .then(_ => {
                      this.progress += 0.1
                      if (provider.usesUnits) {
                        getAndCreateUnits()
                      }
                      else {
                        getAndCreateMissionTpls()
                      }
                    })
                    .catch(error => {
                      console.error('createAssetClasses: error=', error)
                    })
              })
              .catch(error => {
                console.error('getAssetClasses: error=', error)
              })
        }

        const getAndCreateUnits = () => {
          this.progressLabel = 'Importing units...'
          mxmProviderClient.getUnits()
              .then(units => {
                this.createUnits(provider, units)
                    .then(_ => {
                      this.progress += 0.1
                      getAndCreateMissionTpls()
                    })
              })
              .catch(error => {
                console.error('getUnits: error=', error)
              })
        }

        const getAndCreateMissionTpls = () => {
          this.progressLabel = 'Importing mission templates...'
          mxmProviderClient.getMissionTpls()
              .then(missionTpls => {
                this.progress += 0.1
                this.createMissionTpls(provider, missionTpls)
                    .then(_ => {
                      this.closeDialogAndNotify(provider)
                    })
                    .catch(error => {
                      console.error('createMissionTpls: error=', error)
                    })
              })
              .catch(error => {
                console.error('getMissionTpls: error=', error)
              })
        }

        getAndCreateAssetClasses()
      },

      createAssetClasses(provider, assetClasses) {
        if (debug) console.debug('assetClasses=', assetClasses)
        return this.$utl.runInSequence(map(assetClasses, assetClass =>
          this.createAssetClass(provider, assetClass)
        ))
      },

      createAssetClass(provider, assetClass) {
        return new Promise((resolve, reject) => {
          const variables = {
            providerId: provider.providerId,
            className: assetClass.assetClassName,
            description: assetClass.description || null
          }
          if (debug) console.debug('createAssetClass: variables=', variables)

          const mutation = assetClassInsertGql
          this.$apollo.mutate({mutation, variables})
            .then(data => {
              if (debug) console.debug('createAssetClass: mutation data=', data)
              const assets = assetClass.assets || []
              this.createAssets(provider, assetClass, assets)
              resolve(data)
            })
            .catch(error => {
              console.error('createAssetClass: mutation error=', error)
              reject(error)
            })
        })
      },

      createAssets(provider, assetClass, assets) {
        if (debug) console.debug('assets=', assets)
        return this.$utl.runInSequence(map(assets, asset =>
          this.createAsset(provider, assetClass, asset)
        ))
      },

      createAsset(provider, assetClass, asset) {
        return new Promise((resolve, reject) => {
          const variables = {
            providerId: provider.providerId,
            className: assetClass.assetClassName,
            assetId: asset.assetId,
            description: asset.description || null
          }
          if (debug) console.debug('createAsset: variables=', variables)

          const mutation = assetInsertGql
          this.$apollo.mutate({mutation, variables})
            .then(data => {
              if (debug) console.debug('createAsset: mutation data=', data)
              resolve(data)
            })
            .catch(error => {
              console.error('createAsset: mutation error=', error)
              reject(error)
            })
        })
      },

      createUnits(provider, units) {
        if (debug) console.debug('units=', units)
        // sort units so we first create the base units then the others:
        const sortedUnits = orderBy(units, u => u.baseUnit ? 1 : 0)
        const prom = this.$utl.runInSequence(map(sortedUnits, unit =>
            this.createUnit(provider, unit)
        ))
        prom.catch(error => {
          console.error('createUnits: error=', error)
        })
        return prom
      },

      createUnit(provider, unit) {
        return new Promise((resolve, reject) => {
          const variables = {
            providerId: provider.providerId,
            unitName: unit.name,
          }
          if (unit.abbreviation) {
            variables.abbreviation = unit.abbreviation
          }
          if (unit.baseUnit) {
            variables.baseUnit = unit.baseUnit
          }
          if (debug) console.debug('createUnit: variables=', variables)

          const mutation = unitInsertGql
          this.$apollo.mutate({mutation, variables})
              .then(data => {
                if (debug) console.debug('createUnit: mutation data=', data)
                resolve(data)
              })
              .catch(error => {
                console.error('createUnit: mutation error=', error)
                reject(error)
              })
        })
      },

      createMissionTpls(provider, missionTpls) {
        if (debug) console.debug('missionTpls=', missionTpls)
        const remainingProgress = 1.0 - this.progress
        const stepProgress = missionTpls.length && remainingProgress / missionTpls.length
        return this.$utl.runInSequence(map(missionTpls, missionTpl =>
          this.createMissionTpl(provider, missionTpl, stepProgress)
        ))
      },

      createMissionTpl(provider, missionTpl, stepProgress) {
        return new Promise((resolve, reject) => {
          const variables = {
            providerId: provider.providerId,
            missionTplId: missionTpl.missionTplId,
            description: missionTpl.description,
          }
          if (debug) console.debug('createMissionTpl: variables=', variables)

          const mutation = missionTplInsertGql
          this.$apollo.mutate({mutation, variables})
            .then(data => {
              if (debug) console.debug('createMissionTpl: mutation data=', data)
              const assetClassNames = missionTpl.assetClassNames || []
              this.createAssociatedAssetClasses(provider, missionTpl, assetClassNames)
                .then(data => {
                  const parameters = missionTpl.parameters || []
                  this.createParameters(provider, missionTpl, parameters)
                  .then(data => {
                    this.progress += stepProgress
                    resolve(data)
                  })
                })
            })
            .catch(error => {
              console.error('createMissionTpl: mutation error=', error)
              this.progress += stepProgress
              reject(error)
            })
        })
      },

      createAssociatedAssetClasses(provider, missionTpl, assetClassNames) {
        if (debug) console.debug('createAssociatedAssetClasses=', assetClassNames)
        return this.$utl.runInSequence(map(assetClassNames, assetClassName =>
          this.createAssociatedAssetClass(provider, missionTpl, assetClassName)
        ))
      },

      createAssociatedAssetClass(provider, missionTpl, assetClassName) {
        return new Promise((resolve, reject) => {
          const mutation = missionTplAssetClassInsertGql
          const variables = {
            providerId: provider.providerId,
            missionTplId: missionTpl.missionTplId,
            assetClassName
          }
          this.$apollo.mutate({mutation, variables})
            .then(resolve)
            .catch(error => {
              console.error('createAssociatedAssetClass: mutation error=', error)
              reject(error)
            })
        })
      },

      createParameters(provider, missionTpl, parameters) {
        if (debug) console.debug('createParameters=', parameters)
        return this.$utl.runInSequence(map(parameters, parameter =>
          this.createParameter(provider, missionTpl, parameter)
        ))
      },

      createParameter(provider, missionTpl, parameter) {
        if (debug) console.debug(':::: createParameter', parameter.paramName)
        return new Promise((resolve, reject) => {
          const mutation = parameterInsertGql
          const variables = {
            providerId: provider.providerId,
            missionTplId: missionTpl.missionTplId,
            paramName: parameter.paramName,
            type: parameter.type,
            required: parameter.required,
            description: parameter.description,
          }
          if (parameter.defaultValue) {
            variables.defaultValue = '' + parameter.defaultValue
          }
          if (parameter.defaultUnits) {
            variables.defaultUnits = parameter.defaultUnits
          }
          if (parameter.valueCanReference) {
            variables.valueCanReference = parameter.valueCanReference
          }
          this.$apollo.mutate({mutation, variables})
            .then(resolve)
            .catch(error => {
              console.error('createParameter: mutation error=', error)
              reject(error)
            })
        })
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
