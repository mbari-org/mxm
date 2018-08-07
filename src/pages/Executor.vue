<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el label="Executors" to="/executors" />
      <q-breadcrumbs-el label="Executor" :to="`/executors/${params.executorId}`" />
    </q-breadcrumbs>

    <div v-if="detailed">
      <h5> Executor: {{params.executorId}}
        <q-btn
          dense flat icon="refresh" @click="refresh"
        />
      </h5>

      <q-table
        title="Assets"
        :columns="assetColumns"
        :data="assetTable"
        row-key="name"
        class="q-mb-md"
      />

      <q-table
        title="Tasks definitions"
        :columns="taskDefColumns"
        :data="taskDefTable"
        row-key="name"
      >
        <q-td slot="body-cell-taskDefId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link :to="`/executors/${params.executorId}/taskdefs/${props.row.taskDefId}`">
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
import lodash from 'lodash'
const _ = lodash

export default {
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
          label: 'Assets',
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
      const url = `/executors/${this.params.executorId}/detailed`
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
            td.assetClassesString = _.join(td.assetClasses)
            return td
          })
        })
        .catch(e => {
          this.loading = false
          console.error(e)
        })
    }
  },

  watch: {
    '$route' () {
      this.refresh()
    }
  }
}
</script>
