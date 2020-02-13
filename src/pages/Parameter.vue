<template>
  <q-page class="q-pa-md">
    <div v-if="parameter">
      <div class="q-mb-sm">
        Mission Template: <span class="text-bold">{{ params.missionTplId }}</span>
      </div>

      <q-card class="q-mb-md">
        <q-card-section class="row q-gutter-x-md items-center">
          <span>Parameter:</span>
          <div class="q-ml-sm text-bold" style="font-family:monospace;font-size:larger">
            {{ parameter.paramName }}
            <q-popup-edit
              v-model="parameter.paramName"
              title="Parameter Name"
              buttons
            >
              <q-input
                v-model.trim="parameter.paramName"
                clearable autofocus
                class="bg-green-1"
              />
            </q-popup-edit>
          </div>

          <div class="q-ml-xl">
            <q-btn
              :disable="noChanges() || !okToSubmit"
              :color="noChanges() ? 'grey' : 'red'"
              size="sm"
              :class="{'shadow-5': !noChanges()}"
              dense round icon="save"
              @click="updateParameter"
            />
            <q-btn
              v-if="!noChanges()"
              class="q-ml-md"
              color="grey"
              size="sm"
              dense round icon="undo"
              @click="undoParameter"
            />
            <q-btn
              class="q-ml-md"
              color="red"
              size="sm"
              dense round icon="delete"
              @click="deleteParameter"
            />
          </div>

        </q-card-section>
        <q-separator/>
        <q-card-section>

          <div class="column q-gutter-sm">
            <div class="row items-center no-wrap q-gutter-sm">
              <div class="col-1">Type:</div>
              <parameter-type-select
                v-model="parameter.type"
              />
            </div>

            <div
              v-if="$mxmVal.isNumericType(parameter.type)"
              class="row items-center no-wrap q-gutter-x-sm"
            >
              <div class="col-1">Units?:</div>
              <q-checkbox
                v-model="parameter.withUnits"
              />
            </div>

            <div class="row items-start no-wrap q-gutter-x-sm">
              <div class="col-1">Default&nbsp;Value:</div>
              <div>
                <div
                  class="col-11 q-pa-xs"
                  style="min-width:4em"
                >
                  <q-field
                    :error="!!defaultValueError()"
                    :error-message="defaultValueError()"
                    class="bg-blue-1"
                    hide-bottom-space
                  >
                    <parameter-value
                      ref="parameter-value"
                      class="q-pa-xs"
                      style="font-family:monospace;min-width:24em;word-break:break-all"
                      :label="`${params.paramName} default value:`"
                      :param-name="params.paramName"
                      :param-type="parameter.type"
                      :param-value="parameter.defaultValue"
                      :original-value="original.defaultValue"
                      editable
                      @save="val => { parameter.defaultValue = val }"
                      @cancel="() => { parameter.defaultValue = original.defaultValue }"
                    />
                  </q-field>
                  <q-input
                    v-if="$mxmVal.isNumericType(parameter.type) && parameter.withUnits"
                    prefix="Units:"
                    dense hide-bottom-space
                    type="text"
                    v-model.trim="parameter.defaultUnits"
                    :error="!parameter.defaultUnits"
                    class="q-ml-xl q-mt-xs bg-light-blue-1"
                    style="height:2.2em; width:12em"
                  />
                </div>
              </div>
            </div>

            <div
              v-if="parameter.valueCanReference"
              class="row items-center no-wrap q-gutter-x-sm"
            >
              <div>Value can reference:</div>
              <div class="text-bold">
                {{ parameter.valueCanReference }}
              </div>
            </div>

            <q-checkbox
              label="Required?"
              v-model="parameter.required"
            />

            <div class="row items-start no-wrap q-gutter-x-sm">
              <div class="col-1">Description:</div>
              <div>
                <div
                  class="col-11 q-pa-xs"
                  style="min-width:4em"
                >
                  <mxm-markdown
                    style="min-height:4em;min-width:24em"
                    :text="parameter.description"
                    :start-markdown="parameter.missionTplByProviderIdAndMissionTplId.providerByProviderId.descriptionFormat === 'markdown'"
                    editable edit-click
                    @saveDescription="d => { parameter.description = d }"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

    </div>

    <div v-else-if="!loading">
      Parameter not found.
      <div class="q-ml-md">
        Provider: {{params.providerId}} <br/>
        Mission Template ID: {{params.missionTplId}}
      </div>
    </div>

  </q-page>
</template>

<script>
  import parameterGql from '../graphql/parameter.gql'
  import parameterUpdateGql from '../graphql/parameterUpdate.gql'
  import parameterDeleteGql from '../graphql/parameterDelete.gql'

  import ParameterValue from 'components/parameter-value'
  import ParameterTypeSelect from 'components/parameter-type-select'
  import cloneDeep from 'lodash/cloneDeep'
  import isEqual from 'lodash/isEqual'

  const debug = true

  export default {
    components: {
      ParameterValue,
      ParameterTypeSelect,
    },

    data: () => ({
      loading: false,
      parameter: null,
      original: null,
    }),

    computed: {
      params() {
        return this.$route.params
      },

      okToSubmit() {
        return this.parameter.paramName && this.parameter.type
            && !this.defaultValueError()
      },
    },

    apollo: {
      parameter: {
        query: parameterGql,
        variables() {
          return {
            providerId: this.params.providerId,
            missionTplId: this.params.missionTplId,
            paramName: this.params.paramName,
          }
        },
        update(data) {
          let parameter = null
          if (data.parameterByProviderIdAndMissionTplIdAndParamName) {
            parameter = data.parameterByProviderIdAndMissionTplIdAndParamName
          }
          if (debug) console.log('update: parameter=', parameter)
          parameter.withUnits = !!parameter.defaultUnits
          this.original = cloneDeep(parameter)
          return parameter
        },
      },
    },

    mounted() {
      this.$store.commit('utl/setBreadcrumbs', {
        elements: [
          [this.params.providerId, [this.params.providerId]],
          ['MissionTemplates', [this.params.providerId, 'mt']],
          [this.params.missionTplId, [this.params.providerId, 'mt', this.params.missionTplId]],
          ['Params', [this.params.providerId, 'mt', this.params.missionTplId]],
          [this.params.paramName],
        ],
        refresh: this.refreshParameter
      })

      this.original = null
      this.refreshParameter()
    },

    methods: {
      undoParameter() {
        this.parameter = cloneDeep(this.original)
      },

      refreshParameter() {
        this.$apollo.queries.parameter.refetch()
      },

      noChanges() {
        return this.parameter === null || isEqual(this.parameter, this.original)
      },

      defaultValueError() {
        const parval = this.$refs['parameter-value']
        return parval && parval.errorMessage()
      },

      updateParameter() {
        if (debug) console.debug('updateParameter parameter=', this.parameter)
        const mutation = parameterUpdateGql
        const parameterPatch = {}

        if (!isEqual(this.parameter.paramName, this.original.paramName)) {
          parameterPatch.paramName = this.parameter.paramName
        }
        if (!isEqual(this.parameter.type, this.original.type)) {
          parameterPatch.type = this.parameter.type
        }
        if (!isEqual(this.parameter.required, this.original.required)) {
          parameterPatch.required = this.parameter.required
        }
        if (!isEqual(this.parameter.defaultValue, this.original.defaultValue)) {
          parameterPatch.defaultValue = this.parameter.defaultValue
        }

        if (this.parameter.withUnits) {
          if (!isEqual(this.parameter.defaultUnits, this.original.defaultUnits)) {
            parameterPatch.defaultUnits = this.parameter.defaultUnits
          }
        }
        else {
          parameterPatch.defaultUnits = null
        }

        if (!isEqual(this.parameter.description, this.original.description)) {
          parameterPatch.description = this.parameter.description
        }

        const variables = {
          input: {
            id: this.parameter.id,
            parameterPatch
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateParameter: mutation data=', data)
            if (parameterPatch.paramName) {
              this.$utl.replace([this.parameter.providerId, 'missionTpls', this.parameter.missionTplId, 'p', parameterPatch.paramName])
              return
            }
            this.refreshParameter()
          })
          .catch((error) => {
            console.error('updateParameter: mutation error=', error)
          })
      },

      deleteParameter() {
        console.log('deleteParameter: parameter=', this.parameter)
        this.$q.dialog({
          title: 'Confirm',
          message: `Delete parameter '${this.parameter.paramName}'?`,
          color: 'negative',
          ok: `Yes, delete '${this.parameter.paramName}'`,
          cancel: true,
          focus: 'cancel',
        }).onOk(() => {
          const mutation = parameterDeleteGql
          const variables = {
            input: {
              id: this.parameter.id
            }
          }
          this.$apollo.mutate({mutation, variables})
              .then(data => {
                if (debug) console.debug('deleteParameter: mutation data=', data)
                this.$q.notify({
                  message: `Parameter deleted: '${this.parameter.paramName}'`,
                  timeout: 2000,
                  position: 'top',
                  color: 'info',
                })
                this.$utl.replace([this.parameter.providerId, 'missionTpls', this.parameter.missionTplId])
              })
              .catch(error => {
                console.error('deleteParameter: mutation error=', error)
                this.$q.notify({
                  message: `Parameter deletion error: ${JSON.stringify(error)}`,
                  timeout: 0,
                  closeBtn: 'Close',
                  color: 'warning',
                })
              })
        })
      },
    },

    watch: {
      '$route'() {
        this.refreshParameter()
      }
    }
  }
</script>

<style>
  .mission-table td {
    padding: 4px 4px;
    vertical-align: top;
  }
</style>
