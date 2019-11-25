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
      :ok-to-submit="!!okToSubmit"
      :ok-to-dismiss="!!okToDismiss"
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
      </div>
    </utl-dialog>
  </div>
</template>

<script>
  import executorInsert from '../graphql/executorInsert.gql'
  import assetClassInsert from '../graphql/assetClassInsert.gql'
  import assetInsert from '../graphql/assetInsert.gql'
  import missionTplInsert from '../graphql/missionTplInsert.gql'
  import missionTplAssetClassInsert from '../graphql/missionTplAssetClassInsert.gql'
  import parameterInsert from '../graphql/parameterInsert.gql'

  import apiTypeSelect from '../components/api-type-select'

  import map from 'lodash/map'

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
        this.executorId = ''
        this.httpEndpoint = 'http://localhost:8040'
        this.apiType = 'REST0'
        this.description = null
        this.dialogOpened = true
      },

      submit() {
        const variables = {
          input: {
            executor: {
              executorId: this.executorId,
              httpEndpoint: this.httpEndpoint,
              apiType: this.apiType,
              description: this.description
            }
          }
        }

        const mutation = executorInsert
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('mutation data=', data)
            this.executorCreated(variables.input.executor, data)
          })
          .catch(error => {
            console.error('mutation error=', error)
          })
      },

      executorCreated(executor, data) {
        const mxmProviderClient = this.$createMxmProvideClient(executor)
        if (!mxmProviderClient.isSupportedInterface()) {
          this.closeDialogAndNotify(executor)
          return
        }

        mxmProviderClient.getAssetClasses()
          .then(assetClasses => {
            this.createAssetClasses(executor, assetClasses)
              .then(_ => {
                mxmProviderClient.getMissionTpls()
                  .then(missionTpls => {
                    this.createMissionTpls(executor, missionTpls)
                      .then(_ => {
                        this.closeDialogAndNotify(executor)
                      })
                      .catch(error => {
                        console.error('createMissionTpls: error=', error)
                      })
                  })
              })
              .catch(error => {
                console.error('createMissionTpls: error=', error)
              })
          })
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

          const mutation = assetClassInsert
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

          const mutation = assetInsert
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

      createMissionTpls(executor, missionTpls) {
        if (debug) console.debug('missionTpls=', missionTpls)
        return this.$utl.runInSequence(map(missionTpls, missionTpl =>
          this.createMissionTpl(executor, missionTpl)
        ))
      },

      createMissionTpl(executor, missionTpl) {
        return new Promise((resolve, reject) => {
          const variables = {
            executorId: executor.executorId,
            missionTplId: missionTpl.missionTplId,
            description: missionTpl.description,
          }
          if (debug) console.debug('createMissionTpl: variables=', variables)

          const mutation = missionTplInsert
          this.$apollo.mutate({mutation, variables})
            .then(data => {
              if (debug) console.debug('createMissionTpl: mutation data=', data)
              const assetClassNames = missionTpl.assetClassNames || []
              this.createAssociatedAssetClasses(executor, missionTpl, assetClassNames)
                .then(data => {
                  const parameters = missionTpl.parameters || []
                  this.createParameters(executor, missionTpl, parameters)
                  .then(data => {
                    resolve(data)
                  })
                })
            })
            .catch(error => {
              console.error('createMissionTpl: mutation error=', error)
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
          const mutation = missionTplAssetClassInsert
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
          const mutation = parameterInsert
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
