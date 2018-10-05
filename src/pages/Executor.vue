<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el label="Executors" to="/executors" />
      <q-breadcrumbs-el :label="params.executorId" />
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refresh"
      />
    </q-breadcrumbs>

    <pre>executor={{executor}}</pre>

    <div v-if="executor">
      <h5> Executor: {{executor.executorId}}
        - "{{executor.description}}"
      </h5>
      <div class="q-mb-md">
        Endpoint: {{executor.httpEndpoint}}
      </div>

      <q-table
        title="Assets managed by this executor"
        :columns="assetColumns"
        :data="executor.executorAssetsByexecutorid"
        row-key="name"
        class="q-mb-md"
      >
        <div slot="top-right" slot-scope="props" class="fit">
          <asset-new-button
            :executor-id="executor.executorId"
            v-on:created="assetCreated"
          />
        </div>
      </q-table>

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
import AssetNewButton from 'components/asset-new-button'
import TaskdefNewButton from 'components/taskdef-new-button'
import executor from '../graphql/executor.gql'
import lodash from 'lodash'
const _ = lodash

export default {
  components: {
    AssetNewButton,
    TaskdefNewButton
  },

  data () {
    return {
      loading: false,
      detailed: null,
      taskDefs: [],
      assetColumns: [
        {
          field: 'assetId',
          name: 'assetId',
          label: 'ID',
          align: 'left',
          sortable: true
        },
        {
          field: row => row.assetByassetid.assetClass,
          name: 'assetClass',
          label: 'Class',
          align: 'left',
          sortable: true
        },
        {
          field: row => row.assetByassetid.description,
          name: 'description',
          label: 'Description',
          align: 'left',
          sortable: true
        }
      ],

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
        return data.executor[0]
      },
    }
  },

  mounted () {
    this.refresh()
  },

  methods: {
    refresh () {
      // TODO
    },

    assetCreated (data) {
      console.debug('assetCreated: data=', data)
      const asset = {
        assetId: data.assetId,
        assetByassetid: {
          assetClass: data.assetClass,
          description: data.description,
        }
      }
      console.debug('assetCreated: asset=', asset)
      this.executor.executorAssetsByexecutorid.splice(0, 0, asset)
    },

    taskDefCreated (data) {
      data.assetClassesString = _.join(data.assetClasses, ', ')
      this.taskDefTable.splice(0, 0, data)
    }
  },

  watch: {
    '$route' () {
      this.refresh()
    },

    executor (val) {
      console.log('watch executor=', val)
    }
  }
}
</script>
