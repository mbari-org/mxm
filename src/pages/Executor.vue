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
        </q-card-main>
      </q-card>

      <q-table
        :columns="missionDefColumns"
        :data="myMissionDefs"
        row-key="name"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
      >
        <div slot="top-left" slot-scope="props" class="row items-center">
          <div class="col-auto q-headline">
            Mission definitions
          </div>

          <div class="q-ml-md row">
            <q-search
              v-if="myMissionDefs.length"
              class="col"
              color="secondary"
              v-model="filter"
              placeholder="Filter"
              clearable
            />
          </div>
        </div>

        <div slot="top-right" slot-scope="props" class="fit">
          <mission-def-new-button
            :executor-id="executor.executorId"
            v-on:created="missionDefCreated"
          />
        </div>

        <q-td slot="body-cell-missionDefId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link
            :to="`/executors/${encodeURIComponent(executor.executorId)}/missiondefs/${encodeURIComponent(props.row.missionDefId)}`">
            {{props.row.missionDefId}}
          </router-link>
        </q-td>

        <q-td slot="body-cell-assetClassNames" slot-scope="props" :props="props"
        >
          <span v-for="(className, index) in props.row.assetClassNames" :key="className"
          >{{index > 0 ? ', ' : ''}}
            <router-link :to="`/assetclasses/${encodeURIComponent(className)}`"
                         style="text-decoration:none"
            >{{className}}</router-link>

          </span>
        </q-td>

      </q-table>
    </div>

    <div v-else-if="!loading">
      Executor not found: {{params.executorId}}
    </div>

  </q-page>
</template>

<script>
  import MissionDefNewButton from 'components/mission-def-new-button'
  import executor from '../graphql/executor.gql'
  import executorUpdate from '../graphql/executorUpdate.gql'
  import description from '../components/description'
  import {Notify} from 'quasar'
  import _ from 'lodash'

  const debug = true

  export default {
    components: {
      MissionDefNewButton,
      description,
    },

    data() {
      return {
        debug,
        loading: false,
        detailed: null,
        missionDefs: [],

        selectedAssetClasses: [],

        missionDefColumns: [
          {
            field: 'missionDefId',
            name: 'missionDefId',
            label: 'ID',
            align: 'left',
            sortable: true
          },
          {
            field: 'description',
            name: 'description',
            label: 'Description',
            align: 'left',
            sortable: true
          },
          {
            field: 'assetClassNames',
            name: 'assetClassNames',
            label: 'Asset Classes',
            align: 'left',
            sortable: true
          }
        ],
        rowsPerPage: [0],
        pagination: {
          rowsPerPage: 0
        },
        filter: '',
      }
    },

    computed: {
      params() {
        return this.$route.params
      },

      myMissionDefs() {
        const list = this.executor && this.executor.missionDefsByExecutorIdList || []
        _.each(list, e => {
          e.assetClassNames = _.map(e.missionDefAssetClassesByExecutorIdAndMissionDefIdList, 'assetClassName')
        })
        return list
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

      assetClassSelection(data) {
        const newAssetClassNames = _.difference(data, this.myAssetClassNames)
        if (debug) console.debug('assetClassSelection: newAssetClassNames=', newAssetClassNames)

        const added = []
        const next = () => {
          const assetClassName = newAssetClassNames.pop()
          if (assetClassName) {
            if (debug) console.debug('assetClassSelection: next=', assetClassName)
            this.addAssetClassName(assetClassName, ok => {
              if (ok) {
                added.push(assetClassName)
              }
              next()
            })
          }
          else {
            if (added.length) {
              Notify.create({
                message: `Asset associated (${added.length})`,
                timeout: 1000,
                type: 'info'
              })
              this.refreshExecutor()
            }
          }
        }

        next()
      },

      // TODO
      missionDefCreated(data) {
        data.assetClassNames = data.assetClasses
        this.myMissionDefs.splice(0, 0, data)
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
            nodeId: this.executor.nodeId,
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
