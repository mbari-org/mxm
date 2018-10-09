<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el label="Executors" to="/executors" />
      <q-breadcrumbs-el :label="params.executorId" />
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshExecutor"
      />
    </q-breadcrumbs>

    <!--<pre v-if="debug">executor={{executor}}</pre>-->
    <!--<pre v-if="debug">executor.executorAssetclasssByexecutorid={{executor.executorAssetclasssByexecutorid}}</pre>-->

    <div v-if="executor">

      <q-card class="q-mb-md">
        <q-card-title>
          Executor: {{executor.executorId}}
        </q-card-title>
        <q-card-separator />
        <q-card-main>
          <p class="text-italic">
            {{executor.description}}
          </p>
          <div>
            Endpoint: {{executor.httpEndpoint}}
          </div>
        </q-card-main>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-main>
          Asset classes managed:
          <div class="row">
            <q-chip
              class="col-auto q-mr-sm"
              v-for="c in executor.executorAssetclasssByexecutorid"
              :key="c.assetClassName"
              color="secondary"
              small
            >
              {{c.assetClassName}}
              <q-tooltip>
                {{c.assetclassesByassetclassname.description}}
              </q-tooltip>
            </q-chip>

            <asset-class-select-button
              class="col-auto q-ml-md"
              :exclude="myAssetClassNames"
              v-on:selection="assetClassSelection"
            />
          </div>

        </q-card-main>
      </q-card>

      <q-table
        title="Tasks definitions managed by this executor"
        :columns="taskDefColumns"
        :data="taskDefTable"
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
          <router-link :to="`/executors/${encodeURIComponent(executor.executorId)}/taskdefs/${encodeURIComponent(props.row.taskDefId)}`">
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
import AssetClassSelectButton from 'components/asset-class-select-button'
import TaskdefNewButton from 'components/taskdef-new-button'
import executor from '../graphql/executor.gql'
import executor_asset_insert from '../graphql/executor_asset_insert.gql'
import { Notify } from 'quasar'

import lodash from 'lodash'
const _ = lodash

const debug = true

export default {
  components: {
    AssetClassSelectButton,
    TaskdefNewButton
  },

  data () {
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
      taskDefTable: []
    }
  },

  computed: {
    params () {
      return this.$route.params
    },

    myAssetClassNames () {
      return _.map(this.executor.executorAssetclasssByexecutorid, "assetClassName")
    }
  },

  apollo: {
    executor: {
      query: executor,
      variables () {
        return {
          executorId: this.params.executorId
        }
      },
      update(data) {
        console.log('update: data=', data)
        if (data.executors && data.executors.length) {
          const executor = data.executors[0]
          return executor
        }
        else return null
      },
    },
  },

  mounted () {
    this.refreshExecutor()
  },

  methods: {
    refreshExecutor () {
      this.$apollo.queries.executor.refetch()
    },

    assetClassSelection (data) {
      console.debug('assetClassSelection: data=', data)
      // TODO associate any new asset classes

      const newAssetClassNames = _.difference(data, this.myAssetClassNames)
      console.debug('assetClassSelection: newAssetClassNames=', newAssetClassNames)

      const added = []
      const next = () => {
        const assetClassName = newAssetClassNames.pop()
        if (assetClassName) {
          console.debug('assetClassSelection: next=', assetClassName)
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

    addAssetClassName (assetClassName, next) {
      const mutation = executor_asset_insert
      const variables = {
        executorId: this.executor.executorId,
        assetClassName
      }
      this.$apollo.mutate({mutation, variables})
        .then((data) => {
          console.log('mutation data=', data)
          next(true)
        })
        .catch((error) => {
          console.error('mutation error=', error)
          next(false)
        })
    },


    taskDefCreated (data) {
      data.assetClassesString = _.join(data.assetClasses, ', ')
      this.taskDefTable.splice(0, 0, data)
    }
  },

  watch: {
    '$route' () {
      this.refreshExecutor()
    },

    executor (val) {
      console.log('watch executor=', val)
    }
  }
}
</script>
