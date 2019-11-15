<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/${encodeURIComponent(params.executorId)}`"/>
      <q-breadcrumbs-el label="MissionTemplates"/>
      <q-breadcrumbs-el :label="params.missionTplId" :to="`/${encodeURIComponent(params.executorId)}/missiontpls/${encodeURIComponent(params.missionTplId)}`"/>
      <q-breadcrumbs-el label="Params"/>
      <q-breadcrumbs-el :label="params.paramName"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshParameter"
      />
    </q-breadcrumbs>

    <div v-if="parameter" class="q-mt-md">

      <div class="q-mb-sm">
        Mission Template: <span class="text-bold">{{ params.missionTplId }}</span>
      </div>

      <q-card class="q-mb-md">
        <q-card-section>
          Parameter:
          <span class="text-bold" style="font-family:monospace;font-size:larger">
            {{ parameter.paramName }}
            <q-popup-edit
              v-model="parameter.paramName"
              title="Parameter Name"
              buttons
              @save="updateParameter"
            >
              <q-input
                v-model.trim="parameter.paramName"
                clearable
                class="bg-green-1"
              />
            </q-popup-edit>
          </span>
        </q-card-section>
        <q-separator/>
        <q-card-section>

          <table class="mission-table">
            <tbody>
            <tr>
              <td>Required:</td>
              <td>
                <q-checkbox v-model="parameter.required"/>
              </td>
            </tr>
            <tr>
              <td>Type:</td>
              <td>
                <span class="bg-green-1 q-pa-xs">
                  {{parameter.type}}
                </span>
                <q-popup-edit
                  v-model="parameter.type"
                  title="Type"
                  buttons
                >
                  <q-input
                    v-model.trim="parameter.type"
                    clearable
                    :clear-value="original.type"
                    class="bg-green-1"
                  />
                </q-popup-edit>
              </td>
            </tr>
            <tr>
              <td>Default&nbsp;Value:</td>
              <td>
                <div class="bg-green-1 q-pa-xs" style="width:20em;font-family:monospace">
                  {{parameter.defaultValue}}
                </div>
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
              </td>
            </tr>
            <tr>
              <td>Description:</td>
              <td>
                <mxm-markdown :text="parameter.description"/>
                <q-popup-edit
                  v-model="parameter.description"
                  title="Description"
                  buttons persistent
                >
                  <q-input
                    v-model.trim="parameter.description"
                    clearable
                    :clear-value="original.description"
                    class="bg-green-1 q-pl-md q-pr-md"
                    style="font-family:monospace"
                    type="textarea"
                    rows="3"
                    :max-height="300"
                    autofocus @keyup.enter.stop
                  />
                </q-popup-edit>
              </td>
            </tr>
            </tbody>
          </table>

          <q-btn
            :disable="noChanges()"
            :color="noChanges() ? 'grey' : 'red'"
            dense round icon="save" class="q-ml-lg" size="sm"
            @click="updateParameter"
          />

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
  import ParameterValueInput from 'components/parameter-value-input'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      MxmMarkdown,
      ParameterValueInput,
    },

    data() {
      return {
        loading: false,
        parameter: null,
        original: null,
      }
    },

    computed: {
      params() {
        return this.$route.params
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
          this.original = _.cloneDeep(parameter)
          return parameter
        },
      },
    },

    mounted() {
      this.refreshParameter()
    },

    methods: {
      refreshParameter() {
        this.$apollo.queries.parameter.refetch()
      },

      noChanges() {
        return this.parameter === null || _.isEqual(this.parameter, this.original)
      },

      updateParameter() {
        if (debug) console.debug('updateParameter parameter=', this.parameter)
        const mutation = parameterUpdate
        const parameterPatch = {}

        if (!_.isEqual(this.parameter.paramName, this.original.paramName)) {
          parameterPatch.paramName = this.parameter.paramName
        }
        if (!_.isEqual(this.parameter.type, this.original.type)) {
          parameterPatch.type = this.parameter.type
        }
        if (!_.isEqual(this.parameter.required, this.original.required)) {
          parameterPatch.required = this.parameter.required
        }
        if (!_.isEqual(this.parameter.defaultValue, this.original.defaultValue)) {
          parameterPatch.defaultValue = this.parameter.defaultValue
        }
        if (!_.isEqual(this.parameter.description, this.original.description)) {
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
