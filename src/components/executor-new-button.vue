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
      title="Register new executor"
      :ok-to-submit="!!okToSubmit && !progress"
      :ok-to-dismiss="!!okToDismiss && !progress"
      @submit="submit"
      @dialogClosing="dialogOpened = false"
    >
      <div
        class="column q-gutter-sm"
      >
        <div>
          Executor name:
          <q-input
            dense hide-bottom-space
            :error="!executorId.length"
            class="bg-light-blue-1"
            v-model.trim="executorId"
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
  import executorInsertGql from '../graphql/executorInsert.gql'
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
      executorId: '',
      httpEndpoint: '',
      apiType: '',
      description: null,

      progress: null,
      progressLabel: null,
    }),

    computed: {
      okToSubmit() {
        return this.executorId && this.httpEndpoint && this.apiType
      },

      okToDismiss() {
        return !this.executorId
      },
    },

    methods: {
      openDialog() {
        this.apiType = 'REST0'

        this.executorId = 'TethysDash'
        this.httpEndpoint = 'http://tethyssim.shore.mbari.org:8080/TethysDash/api/mxm'
        this.description = 'TethysDash/LRAUV System'

        // this.executorId = 'TFT'
        // this.httpEndpoint = 'http://localhost:8040'
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
                this.createExecutorAndEntities(mxmProviderClient, capabilities)
              })
              .catch(error => {
                console.error('getCapabilities: error=', error)
              })
        }
        else {
          this.createExecutorAndEntities(mxmProviderClient)
        }
      },

      createExecutorAndEntities(mxmProviderClient, capabilities = {}) {
        const variables = {
          input: {
            executor: {
              executorId: this.executorId,
              httpEndpoint: this.httpEndpoint,
              apiType: this.apiType,
              description: this.description,
              canValidate: capabilities.canValidate,
              usesUnits: capabilities.usesUnits,
              descriptionFormat: capabilities.descriptionFormat,
            }
          }
        }

        const mutation = executorInsertGql
        this.$apollo.mutate({mutation, variables})
            .then(data => {
              if (debug) console.debug('mutation data=', data)
              if (mxmProviderClient.isSupportedInterface()) {
                this.createOtherEntities(mxmProviderClient, variables.input.executor, data)
              }
              else {
                this.closeDialogAndNotify(variables.input.executor)
              }
            })
            .catch(error => {
              console.error('mutation error=', error)
            })
      },

      createOtherEntities(mxmProviderClient, executor, data) {
        const getAndCreateAssetClasses = () => {
          this.progress += 0.1
          this.progressLabel = 'Importing asset classes...'
          mxmProviderClient.getAssetClasses()
              .then(assetClasses => {
                this.progress += 0.1
                this.createAssetClasses(executor, assetClasses)
                    .then(_ => {
                      this.progress += 0.1
                      if (executor.usesUnits) {
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
                this.createUnits(executor, units)
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
                this.createMissionTpls(executor, missionTpls)
                    .then(_ => {
                      this.closeDialogAndNotify(executor)
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

      createAssetClasses(executor, assetClasses) {
        if (debug) console.debug('assetClasses=', assetClasses)
        return this.$utl.runInSequence(map(assetClasses, assetClass =>
          this.createAssetClass(executor, assetClass)
        ))
      },

      createAssetClass(executor, assetClass) {
        return new Promise((resolve, reject) => {
          const variables = {
            executorId: executor.executorId,
            className: assetClass.assetClassName,
            description: assetClass.description || null
          }
          if (debug) console.debug('createAssetClass: variables=', variables)

          const mutation = assetClassInsertGql
          this.$apollo.mutate({mutation, variables})
            .then(data => {
              if (debug) console.debug('createAssetClass: mutation data=', data)
              const assets = assetClass.assets || []
              this.createAssets(executor, assetClass, assets)
              resolve(data)
            })
            .catch(error => {
              console.error('createAssetClass: mutation error=', error)
              reject(error)
            })
        })
      },

      createAssets(executor, assetClass, assets) {
        if (debug) console.debug('assets=', assets)
        return this.$utl.runInSequence(map(assets, asset =>
          this.createAsset(executor, assetClass, asset)
        ))
      },

      createAsset(executor, assetClass, asset) {
        return new Promise((resolve, reject) => {
          const variables = {
            executorId: executor.executorId,
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

      createUnits(executor, units) {
        if (debug) console.debug('units=', units)
        // sort units so we first create the base units then the others:
        const sortedUnits = orderBy(units, u => u.baseUnit ? 1 : 0)
        const prom = this.$utl.runInSequence(map(sortedUnits, unit =>
            this.createUnit(executor, unit)
        ))
        prom.catch(error => {
          console.error('createUnits: error=', error)
        })
        return prom
      },

      createUnit(executor, unit) {
        return new Promise((resolve, reject) => {
          const variables = {
            executorId: executor.executorId,
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

      createMissionTpls(executor, missionTpls) {
        if (debug) console.debug('missionTpls=', missionTpls)
        const remainingProgress = 1.0 - this.progress
        const stepProgress = missionTpls.length && remainingProgress / missionTpls.length
        return this.$utl.runInSequence(map(missionTpls, missionTpl =>
          this.createMissionTpl(executor, missionTpl, stepProgress)
        ))
      },

      createMissionTpl(executor, missionTpl, stepProgress) {
        return new Promise((resolve, reject) => {
          const variables = {
            executorId: executor.executorId,
            missionTplId: missionTpl.missionTplId,
            description: missionTpl.description,
          }
          if (debug) console.debug('createMissionTpl: variables=', variables)

          const mutation = missionTplInsertGql
          this.$apollo.mutate({mutation, variables})
            .then(data => {
              if (debug) console.debug('createMissionTpl: mutation data=', data)
              const assetClassNames = missionTpl.assetClassNames || []
              this.createAssociatedAssetClasses(executor, missionTpl, assetClassNames)
                .then(data => {
                  const parameters = missionTpl.parameters || []
                  this.createParameters(executor, missionTpl, parameters)
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

      createAssociatedAssetClasses(executor, missionTpl, assetClassNames) {
        if (debug) console.debug('createAssociatedAssetClasses=', assetClassNames)
        return this.$utl.runInSequence(map(assetClassNames, assetClassName =>
          this.createAssociatedAssetClass(executor, missionTpl, assetClassName)
        ))
      },

      createAssociatedAssetClass(executor, missionTpl, assetClassName) {
        return new Promise((resolve, reject) => {
          const mutation = missionTplAssetClassInsertGql
          const variables = {
            executorId: executor.executorId,
            missionTplId: missionTpl.missionTplId,
            assetClassName
          }
          this.$apollo.mutate({mutation, variables})
            .then(data => {
              resolve(data)
            })
            .catch(error => {
              console.error('createAssociatedAssetClass: mutation error=', error)
              reject(error)
            })
        })
      },

      createParameters(executor, missionTpl, parameters) {
        if (debug) console.debug('createParameters=', parameters)
        return this.$utl.runInSequence(map(parameters, parameter =>
          this.createParameter(executor, missionTpl, parameter)
        ))
      },

      createParameter(executor, missionTpl, parameter) {
        if (debug) console.debug(':::: createParameter', parameter.paramName)
        return new Promise((resolve, reject) => {
          const mutation = parameterInsertGql
          const variables = {
            executorId: executor.executorId,
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
            .then(data => {
              resolve(data)
            })
            .catch(error => {
              console.error('createParameter: mutation error=', error)
              reject(error)
            })
        })
      },

      closeDialogAndNotify(executor) {
        this.progress = null
        this.progressLabel = null
        this.dialogOpened = false
        this.$q.notify({
          message: `Executor created: ${executor.executorId}`,
          timeout: 1000,
          position: 'top',
          color: 'info',
        })
        this.$emit('created', executor)
      },
    }
  }
</script>
