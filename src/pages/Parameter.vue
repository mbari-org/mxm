<template>
  <q-page class="q-pa-md">
    <div v-if="parameter">
      <div class="q-mb-lg">
        Mission Template: <span class="text-bold">{{ params.missionTplId }}</span>
      </div>

      <q-card class="q-mb-md">
        <q-card-section class="row q-gutter-md items-center">
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
              @click="refreshParameter"
            />
          </div>

        </q-card-section>
        <q-separator/>
        <q-card-section>

          <div class="column q-gutter-sm">
            <div class="row items-center no-wrap q-gutter-sm">
              <div class="col-1">Required:</div>
              <q-checkbox v-model="parameter.required"/>
            </div>

            <div class="row items-center no-wrap q-gutter-sm">
              <div class="col-1">Type:</div>
              <parameter-type-select
                v-model="parameter.type"
              />
            </div>

            <div class="row items-top no-wrap q-gutter-sm">
              <div class="col-1">Default&nbsp;Value:</div>
              <div>
                <div
                  class="col-11 bg-blue-1 q-pa-xs"
                  style="min-width:4em"
                >
                  <q-field
                    :error="!!defaultValueError()"
                    :error-message="defaultValueError()"
                  >
                    <parameter-value
                      ref="parameter-value"
                      class="q-pa-xs"
                      style="font-family:monospace;min-width:24em;word-break:break-all"
                      :param-type="parameter.type"
                      :param-value="parameter.defaultValue"
                    />
                    <q-popup-edit
                      buttons
                      v-model="parameter.defaultValue"
                    >
                      <parameter-value-input
                        :param-name="parameter.paramName"
                        v-model="parameter.defaultValue"
                        :param-type="parameter.type"
                        editable
                      />
                    </q-popup-edit>
                  </q-field>
                </div>
              </div>
            </div>

            <div class="row items-top no-wrap q-gutter-sm">
              <div class="col-1">Description:</div>
              <div>
                <div
                  class="col-11 bg-blue-1 q-pa-xs"
                  style="min-width:4em"
                >
                  <mxm-markdown
                    style="min-height:4em;min-width:24em"
                    :text="parameter.description"
                    editable
                    v-on:saveDescription="d => { parameter.description = d }"
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
        Executor: {{params.executorId}} <br/>
        Mission Template ID: {{params.missionTplId}}
      </div>
    </div>

  </q-page>
</template>

<style>
  .mission-table td {
    padding: 4px 4px;
    vertical-align: top;
  }
</style>

<script>
  import parameter from '../graphql/parameter.gql'
  import parameterUpdate from '../graphql/parameterUpdate.gql'
  import MxmMarkdown from 'components/mxm-markdown'
  import ParameterValue from 'components/parameter-value'
  import ParameterValueInput from 'components/parameter-value-input'
  import ParameterTypeSelect from 'components/parameter-type-select'
  import cloneDeep from 'lodash/cloneDeep'
  import isEqual from 'lodash/isEqual'

  const debug = true

  export default {
    components: {
      MxmMarkdown,
      ParameterValue,
      ParameterValueInput,
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
        query: parameter,
        variables() {
          return {
            executorId: this.params.executorId,
            missionTplId: this.params.missionTplId,
            paramName: this.params.paramName,
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          let parameter = null
          if (data.parameterByExecutorIdAndMissionTplIdAndParamName) {
            parameter = data.parameterByExecutorIdAndMissionTplIdAndParamName
          }
          this.original = cloneDeep(parameter)
          return parameter
        },
      },
    },

    mounted() {
      this.$store.commit('utl/setBreadcrumbs', {
        elements: [
          ['Home', []],
          [this.params.executorId, [this.params.executorId]],
          ['MissionTemplates', [this.params.executorId, 'missiontpls']],
          [this.params.missionTplId, [this.params.executorId, 'missiontpls', this.params.missionTplId]],
          ['Params', [this.params.executorId, 'missiontpls', this.params.missionTplId]],
          [this.params.paramName],
        ],
        refresh: this.refreshParameter
      })

      this.refreshParameter()
    },

    methods: {
      refreshParameter() {
        this.$apollo.queries.parameter.refetch()
            // .then(res => {
            //   console.log('refetch', res.data.parameterByExecutorIdAndMissionTplIdAndParamName.required)
            // })
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
        const mutation = parameterUpdate
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
              this.$router.replace(`/${encodeURIComponent(this.parameter.executorId)}/missionTpls/${encodeURIComponent(this.parameter.missionTplId)}/params/${encodeURIComponent(parameterPatch.paramName)}`)
              return
            }
            this.refreshParameter()
          })
          .catch((error) => {
            console.error('updateParameter: mutation error=', error)
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
