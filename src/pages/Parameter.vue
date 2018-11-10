<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Executors" to="/executors"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/executors/${encodeURIComponent(params.executorId)}`"/>
      <q-breadcrumbs-el label="MissionDefs"/>
      <q-breadcrumbs-el :label="params.missionDefId" :to="`/executors/${encodeURIComponent(params.executorId)}/MissionDefs/${encodeURIComponent(params.missionDefId)}`"/>
      <q-breadcrumbs-el label="Params"/>
      <q-breadcrumbs-el :label="params.paramName"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshParameter"
      />
    </q-breadcrumbs>

    <div v-if="parameter" class="q-mt-md">

      <div class="q-mb-sm">
        Mission Definition: <span class="text-bold">{{ params.missionDefId }}</span>
      </div>

      <q-card class="q-mb-md">
        <q-card-title>
          Parameter: <span class="text-bold">{{ params.paramName }}</span>
        </q-card-title>
        <q-card-separator/>
        <q-card-main>

          <table class="mission-table">
            <tbody>
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
                  <q-field>
                    <q-input
                      v-model.trim="parameter.type"
                      clearable
                      :clear-value="original.type"
                      class="bg-green-1"
                    />
                  </q-field>
                </q-popup-edit>
              </td>
            </tr>
            <tr>
              <td>Required:</td>
              <td>
                <q-checkbox v-model="parameter.required"/>
              </td>
            </tr>
            <tr>
              <td>Default&nbsp;Value:</td>
              <td>
                <span class="bg-green-1 q-pa-xs">
                  {{parameter.defaultValue}}
                </span>
                <q-popup-edit
                  v-model="parameter.defaultValue"
                  title="Default Value"
                  buttons
                >
                  <q-field>
                    <q-input
                      v-model.trim="parameter.defaultValue"
                      clearable
                      :clear-value="original.defaultValue"
                      class="bg-green-1"
                    />
                  </q-field>
                </q-popup-edit>
              </td>
            </tr>
            <tr>
              <td>Description:</td>
              <td>
                <description :text="parameter.description" />
                <q-popup-edit
                  v-model="parameter.description"
                  title="Description"
                  buttons
                >
                  <q-field>
                    <q-input
                      v-model.trim="parameter.description"
                      clearable
                      :clear-value="original.description"
                      class="bg-green-1"
                      type="textarea"
                      rows="3"
                      :max-height="300"
                    />
                  </q-field>
                </q-popup-edit>
              </td>
            </tr>
            </tbody>
          </table>

          <q-btn
            :disable="noChanges()"
            dense round icon="save" class="q-ml-lg" size="sm"
            @click="updateParameter"
          />

        </q-card-main>
      </q-card>

    </div>

    <div v-else-if="!loading">
      Parameter not found.
      <div class="q-ml-md">
        Executor: {{params.executorId}} <br/>
        Mission Definition ID: {{params.missionDefId}}
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
  import description from 'components/description'
  import {Notify} from 'quasar'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      description,
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
            missionDefId: this.params.missionDefId,
            paramName: this.params.paramName,
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          let parameter = null
          if (data.parameterByExecutorIdAndMissionDefIdAndName) {
            parameter = data.parameterByExecutorIdAndMissionDefIdAndName
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

        if (!_.isEqual(this.parameter.name, this.original.name)) {
          parameterPatch.name = this.parameter.name
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
            nodeId: this.parameter.nodeId,
            parameterPatch
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateParameter: mutation data=', data)
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
