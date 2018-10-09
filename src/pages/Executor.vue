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
    <!--<pre v-if="debug">selectedAssets={{selectedAssets}}</pre>-->
    <!--<pre v-if="debug">assetSelectOptions={{assetSelectOptions}}</pre>-->

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
        <q-card-title>
          Asset classes managed by this executor:
          <asset-class-new-button
            slot="right"
            v-on:created="assetClassCreated"
          />

        </q-card-title>
        <q-card-separator />
        <q-card-main>
          <div>
            <q-select
              hide-underline
              multiple
              chips
              style="width:auto"
              v-model="selectedAssets"
              :options="assetSelectOptions"
              @input="assetSelectionChange"
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
import AssetClassNewButton from 'components/asset-class-new-button'
import TaskdefNewButton from 'components/taskdef-new-button'
import executor from '../graphql/executor.gql'
import assetClasses from '../graphql/asset_classes.gql'

// TODO mutations
//import executor_asset_insert from '../graphql/executor_asset_insert.gql'

import lodash from 'lodash'
const _ = lodash

const debug = true

export default {
  components: {
    AssetClassNewButton,
    TaskdefNewButton
  },

  data () {
    return {
      debug,
      loading: false,
      detailed: null,
      taskDefs: [],

      selectedAssets: [],

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

    assetSelectOptions () {
      console.debug('this.executor.executorAssetclasssByexecutorid=', this.executor.executorAssetclasssByexecutorid)
      this.selectedAssets = _.map(this.executor.executorAssetclasssByexecutorid, a => a.assetClassName)

      console.debug('this.assetClasses=', this.assetClasses)
      return _.map(this.assetClasses, a => {
        return {
          label: a.className,
          value: a.className
        }
      })
    },
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
        const executor = data.executors[0]
        this.selectedAssets = _.map(executor.executorAssetsByexecutorid, "assetId")
        return executor
      },
    },

    assetClasses,
  },

  mounted () {
    this.refreshExecutor()
  },

  methods: {
    refreshExecutor () {
      this.$apollo.queries.executor.refetch()
    },

    assetSelectionChange (v) {
      console.debug('assetSelectionChange', v)
    },

    assetClassCreated (data) {
      console.debug('assetClassCreated: data=', data)
      const assetClass = {
        assetId: data.assetId,
        assetByassetid: {
          assetClass: data.assetClass,
          description: data.description,
        }
      }
      console.debug('assetClassCreated: assetClass=', assetClass)
      this.executor.executorAssetclasssByexecutorid.splice(0, 0, assetClass)
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
