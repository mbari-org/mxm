<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light" class="q-mb-sm">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el :label="params.executorId"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshExecutor"
      />
    </q-breadcrumbs>

    <!--<pre v-if="debug">executor={{executor}}</pre>-->

    <div v-if="executor">

      <q-card class="q-mb-md q-mt-lg">
        <q-card-section class="row q-gutter-md items-center">
          <span>Executor:</span>
          <span class="text-bold">{{executor.executorId}}</span>

          <div class="q-ml-xl">
            <q-btn
              :disable="noChanges()"
              :color="noChanges() ? 'grey' : 'red'"
              size="sm"
              :class="{'shadow-5': !noChanges()}"
              dense round icon="save"
              @click="updateExecutor"
            />
            <q-btn
              v-if="!noChanges()"
              class="q-ml-md"
              color="grey"
              size="sm"
              dense round icon="undo"
              @click="refreshExecutor"
            />
          </div>
        </q-card-section>

        <q-separator/>
        <q-card-section>
          <div>
            <mxm-markdown :text="executor.description"/>
            <q-popup-edit
              v-model="executor.description"
              title="Description"
              buttons persistent
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
                  buttons
                >
                  <api-type-select
                    :value="executor.apiType"
                    @input="val => { executor.apiType = val.value }"
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
  import cloneDeep from 'lodash/cloneDeep'
  import isEqual from 'lodash/isEqual'

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
        original: null,
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
          let executor = null
          if (data.allExecutorsList && data.allExecutorsList.length) {
            executor = data.allExecutorsList[0]
          }
          this.original = cloneDeep(executor)
          return executor
        },
      },
    },

    mounted() {
      this.refreshExecutor()
    },

    methods: {
      noChanges() {
        return this.executor === null || isEqual(this.executor, this.original)
      },

      refreshExecutor() {
        this.$apollo.queries.executor.refetch()
      },

      updateExecutor() {
        if (debug) console.debug('updateExecutor executor=', this.executor)
        const mutation = executorUpdate
        const executorPatch = {}

        if (!isEqual(this.executor.description, this.original.description)) {
          executorPatch.description = this.executor.description
        }
        if (!isEqual(this.executor.httpEndpoint, this.original.httpEndpoint)) {
          executorPatch.httpEndpoint = this.executor.httpEndpoint
        }
        if (!isEqual(this.executor.apiType, this.original.apiType)) {
          executorPatch.apiType = this.executor.apiType
        }

        const variables = {
          input: {
            id: this.executor.id,
            executorPatch
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateExecutor: mutation data=', data)
            this.refreshExecutor()
            this.$q.notify({
              message: `Executor updated`,
              timeout: 1000,
              type: 'info'
            })
          })
          .catch((error) => {
            console.error('updateExecutor: mutation error=', error)
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
