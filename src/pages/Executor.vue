<template>
  <q-page class="q-pa-md">
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
            <mxm-markdown
              expandable init-expanded expandable-title="Description:"
              :text="executor.description"
              editable
              @saveDescription="d => { executor.description = d }"
            />
          </div>
          <q-separator/>

          <div class="column q-mb-md q-gutter-md">
            <div class="row q-gutter-md">
              <q-btn
                :label="`Mission Templates (${numMissionTemplates()})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.executorId, 'mt'])"
              />

              <q-btn
                :label="`Asset Classes (${numAssetClasses()})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.executorId, 'ac'])"
              />

              <q-btn
                :label="`Assets (${numAssets()})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.executorId, 'a'])"
              />

              <q-btn
                :label="`Units (${numUnits()})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.executorId, 'u'])"
              />
            </div>

            <div class="row q-gutter-md">
              <q-btn
                :label="`Missions (${numMissions()})`"
                no-wrap no-caps dense
                :to="$utl.routeLoc([params.executorId, 'm'])"
              />
            </div>
          </div>

          <q-separator/>
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
                    clearable autofocus
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
  import cloneDeep from 'lodash/cloneDeep'
  import isEqual from 'lodash/isEqual'
  import reduce from 'lodash/reduce'

  const debug = false

  export default {
    components: {
      apiTypeSelect,
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
      this.$store.commit('utl/setBreadcrumbs', {
        elements: [
          ['Home', []],
          [this.params.executorId],
        ],
        refresh: this.refreshExecutor
      })

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
              color: 'info',
            })
          })
          .catch((error) => {
            console.error('updateExecutor: mutation error=', error)
          })
      },

      numMissionTemplates() {
        if (this.executor) {
          return this.executor.missionTplsByExecutorIdList.length
        }
        else return 0
      },

      numMissions() {
        if (this.executor) {
          return reduce(this.executor.missionTplsByExecutorIdList,
              (result, missionTemplate) => result + missionTemplate.missionsByExecutorIdAndMissionTplIdList.length,
              0
          )
        }
        else return 0
      },

      numAssetClasses() {
        if (this.executor) {
          return this.executor.assetClassesByExecutorIdList.length
        }
        else return 0
      },

      numAssets() {
        if (this.executor) {
          return reduce(this.executor.assetClassesByExecutorIdList,
              (result, assetClass) => result + assetClass.assetsByExecutorIdAndClassNameList.length,
              0
          )
        }
        else return 0
      },

      numUnits() {
        if (this.executor) {
          return this.executor.unitsByExecutorIdList.length
        }
        else return 0
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
