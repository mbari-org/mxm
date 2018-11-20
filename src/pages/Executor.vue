<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Executors" to="/executors"/>
      <q-breadcrumbs-el :label="params.executorId"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshExecutor"
      />
    </q-breadcrumbs>

    <!--<pre v-if="debug">executor={{executor}}</pre>-->

    <div v-if="executor">

      <q-card class="q-mb-md">
        <q-card-title>
          Executor: <span class="text-bold">{{executor.executorId}}</span>
        </q-card-title>
        <q-card-separator/>
        <q-card-main>
          <div>
            <description :text="executor.description"/>
            <q-popup-edit
              v-model="executor.description"
              title="Description"
              buttons
              @save="updateDescription"
            >
              <q-field>
                <q-input
                  v-model.trim="executor.description"
                  clearable
                  class="bg-green-1"
                  type="textarea"
                  rows="3"
                  :max-height="300"
                />
              </q-field>
            </q-popup-edit>
          </div>

          <table class="q-mt-sm">
            <tbody>
            <tr>
              <td>Endpoint:</td>
              <td>
                <span class="text-bold">
                  {{executor.httpEndpoint}}
                </span>
                <q-popup-edit
                  v-model="executor.httpEndpoint"
                  title="Endpoint"
                  buttons
                  @save="updateHttpEndpoint"
                >
                  <q-field>
                    <q-input
                      v-model.trim="executor.httpEndpoint"
                      clearable
                      class="bg-green-1"
                    />
                  </q-field>
                </q-popup-edit>
              </td>
            </tr>
            </tbody>
          </table>

          <div class="q-ma-sm">
            <q-btn
              class="q-mr-sm"
              label="Mission Definitions"
              color="secondary"
              no-wrap no-caps dense
              :to="`/executors/${encodeURIComponent(params.executorId)}/missiondefs`"
            />

            <q-btn
              class="q-mr-sm"
              label="Missions"
              color="secondary"
              no-wrap no-caps dense
              :to="`/executors/${encodeURIComponent(params.executorId)}/missions`"
            />

            <q-btn
              class="q-mr-sm"
              label="Asset Classes"
              color="secondary"
              no-wrap no-caps dense
              :to="`/executors/${encodeURIComponent(params.executorId)}/assetclasses`"
            />

            <q-btn
              label="Assets"
              color="secondary"
              no-wrap no-caps dense
              :to="`/executors/${encodeURIComponent(params.executorId)}/assets`"
            />
          </div>

        </q-card-main>
      </q-card>

    </div>

    <div v-else-if="!loading">
      Executor not found: {{params.executorId}}
    </div>

  </q-page>
</template>

<script>
  import executor from '../graphql/executor.gql'
  import executorUpdate from '../graphql/executorUpdate.gql'
  import description from '../components/description'
  import {Notify} from 'quasar'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      description,
    },

    data() {
      return {
        debug,
        loading: false,
      }
    },

    computed: {
      params() {
        return this.$route.params
      },
    },

    apollo: {
      executor: {
        query: executor,
        variables() {
          return {
            executorId: this.params.executorId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          if (data.allExecutorsList && data.allExecutorsList.length) {
            return data.allExecutorsList[0]
          }
          else return null
        },
      },
    },

    mounted() {
      this.refreshExecutor()
    },

    methods: {
      refreshExecutor() {
        this.$apollo.queries.executor.refetch()
      },

      updateDescription(description) {
        this.updateExecutor({description})
      },

      updateHttpEndpoint(httpEndpoint) {
        this.updateExecutor({httpEndpoint})
      },

      updateExecutor(executorPatch) {
        if (debug) console.debug('updateExecutor executorPatch=', executorPatch)
        const mutation = executorUpdate
        const variables = {
          input: {
            id: this.executor.id,
            executorPatch
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateDescription: mutation data=', data)
            if (executorPatch.description) {
              this.executor.description = executorPatch.description
            }
            if (executorPatch.httpEndpoint) {
              this.executor.httpEndpoint = executorPatch.httpEndpoint
            }
          })
          .catch((error) => {
            console.error('updateDescription: mutation error=', error)
          })
      },
    },

    watch: {
      '$route'() {
        this.refreshExecutor()
      },

      executor(val) {
        if (debug) console.log('watch executor=', val)
      }
    }
  }
</script>
