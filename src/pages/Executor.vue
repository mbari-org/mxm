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

    <div v-if="detailed">
      <h5> Executor: {{params.executorId}}
      </h5>

      <q-table
        title="Assets managed by this executor"
        :columns="assetColumns"
        :data="assetTable"
        row-key="name"
        class="q-mb-md"
      >
        <div slot="top-right" slot-scope="props" class="fit">
          <asset-new-button
            :executor-id="params.executorId"
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
            :executor-id="params.executorId"
            v-on:created="taskDefCreated"
          />
        </div>

        <q-td slot="body-cell-taskDefId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link :to="`/executors/${encodeURIComponent(params.executorId)}/taskdefs/${encodeURIComponent(props.row.taskDefId)}`">
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
          field: 'assetClass',
          name: 'assetClass',
          label: 'Class',
          align: 'left',
          sortable: true
        },
        {
          field: 'description',
          name: 'description',
          label: 'Description',
          align: 'left',
          sortable: true
        }
      ],
      assetTable: [],

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

  mounted () {
    this.refresh()
  },

  methods: {
    refresh () {
      this.loading = true
      this.detailed = null
      const url = `/executors/${encodeURIComponent(this.params.executorId)}/detailed`
      this.$axios({
        method: 'GET',
        url
      })
        .then(response => {
          this.loading = false
          console.log(`GET ${url}: response=`, response)
          this.detailed = response.data
          this.assetTable = _.get(this.detailed, 'assets') || []
          this.taskDefs = _.get(this.detailed, 'taskDefs') || []
          this.taskDefTable = _.map(this.taskDefs, td => {
            td.assetClassesString = _.join(td.assetClasses, ', ')
            return td
          })
        })
        .catch(e => {
          this.loading = false
          console.error(e)
        })
    },

    assetCreated (data) {
      this.assetTable.splice(0, 0, data)
    },

    taskDefCreated (data) {
      data.assetClassesString = _.join(data.assetClasses, ', ')
      this.taskDefTable.splice(0, 0, data)
    }
  },

  watch: {
    '$route' () {
      this.refresh()
    }
  }
}
</script>
