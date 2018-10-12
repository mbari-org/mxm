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
          Executor: {{executor.executorId}}
        </q-card-title>
        <q-card-separator/>
        <q-card-main>
          <p class="text-italic">
            {{executor.description}}
          </p>
          <div>
            Endpoint: {{executor.httpEndpoint}}
          </div>
        </q-card-main>
      </q-card>

      <q-table
        title="Tasks definitions managed by this executor"
        :columns="taskDefColumns"
        :data="myTaskDefs"
        row-key="name"
      >
        <div slot="top-right" slot-scope="props" class="fit">
          <taskdef-new-button
            :executor-id="executor.executorId"
            v-on:created="taskDefCreated"
          />
        </div>

        <q-td slot="body-cell-taskDefId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link
            :to="`/executors/${encodeURIComponent(executor.executorId)}/taskdefs/${encodeURIComponent(props.row.taskDefId)}`">
            {{props.row.taskDefId}}
          </router-link>
        </q-td>

      </q-table>
    </div>

    <div v-else-if="!loading">
      Executor not found: {{params.executorId}}
    </div>

  </q-page>
</template>

<script>
  import TaskdefNewButton from 'components/taskdef-new-button'
  import executor from '../graphql/executor.gql'
  import {Notify} from 'quasar'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      TaskdefNewButton
    },

    data() {
      return {
        debug,
        loading: false,
        detailed: null,
        taskDefs: [],

        selectedAssetClasses: [],

        taskDefColumns: [
          {
            field: 'taskDefId',
            name: 'taskDefId',
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
            field: 'assetClassesString',
            name: 'assetClassesString',
            label: 'Asset Classes',
            align: 'left',
            sortable: true
          }
        ],
      }
    },

    computed: {
      params() {
        return this.$route.params
      },

      myTaskDefs() {
        const list = this.executor && this.executor.taskDefsByExecutorIdList || []
        _.each(list, e => {
          e.assetClassesString = _.join(
            _.map(e.taskdefAssetClassesByExecutorIdAndTaskDefIdList, 'assetClassName'),
            ', '
          )
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
      taskDefCreated(data) {
        data.assetClassesString = _.join(data.assetClasses, ', ')
        this.myTaskDefs.splice(0, 0, data)
      }
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
