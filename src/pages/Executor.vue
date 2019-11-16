<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el :label="params.executorId"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshExecutor"
      />
    </q-breadcrumbs>

    <!--<pre v-if="debug">executor={{executor}}</pre>-->

    <div v-if="executor">

      <q-card class="q-mb-md">
        <q-card-section>
          Executor: <span class="text-bold">{{executor.executorId}}</span>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <div>
            <mxm-markdown :text="executor.description"/>
            <q-popup-edit
              v-model="executor.description"
              title="Description"
              buttons persistent
              @save="updateDescription"
            >
              <q-input
                v-model.trim="executor.description"
                clearable
                class="bg-green-1 q-pl-md q-pr-md"
                style="font-family:monospace"
                type="textarea"
                rows="3"
                :max-height="300"
                autofocus @keyup.enter.stop
              />
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
                  <q-input
                    v-model.trim="executor.httpEndpoint"
                    clearable
                    class="bg-green-1"
                  />
                </q-popup-edit>
              </td>
            </tr>
            <tr>
              <td>API Type:</td>
              <td>
                <span class="text-bold">
                  {{executor.apiType}}
                </span>
                <q-popup-edit
                  v-model="executor.apiType"
                  title="API Type"
                >
                  <api-type-select
                    :value="executor.apiType"
                    v-on:change="updateApiType"
                  />
                </q-popup-edit>
              </td>
            </tr>
            </tbody>
          </table>

          <div class="q-ma-sm">
            <q-btn
              class="q-mr-sm"
              label="Mission Templates"
              color="secondary"
              no-wrap no-caps dense
              :to="`/${encodeURIComponent(params.executorId)}/missiontpls`"
            />

            <q-btn
              class="q-mr-sm"
              label="Asset Classes"
              color="secondary"
              no-wrap no-caps dense
              :to="`/${encodeURIComponent(params.executorId)}/assetclasses`"
            />

            <q-btn
              label="Assets"
              color="secondary"
              no-wrap no-caps dense
              :to="`/${encodeURIComponent(params.executorId)}/assets`"
            />
          </div>

          <div class="q-ma-sm">
            <q-btn
              class="q-mr-sm"
              label="Missions"
              color="secondary"
              no-wrap no-caps dense
              :to="`/${encodeURIComponent(params.executorId)}/missions`"
            />
          </div>

        </q-card-section>
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
  import apiTypeSelect from '../components/api-type-select'
  import MxmMarkdown from '../components/mxm-markdown'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      apiTypeSelect,
      MxmMarkdown,
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
        // TODO broader consequences of changing http endpoint
        this.updateExecutor({httpEndpoint})
      },

      updateApiType(apiType) {
        // TODO broader consequences of changing API Type
        this.updateExecutor({apiType})
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
            if (executorPatch.apiType) {
              this.executor.apiType = executorPatch.apiType
            }
            this.$q.notify({
              message: `Executor updated (${_.join(_.keys(executorPatch))})`,
              timeout: 1000,
              type: 'info'
            })

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
