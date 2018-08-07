<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el label="Executors" to="/executors" />
      <q-breadcrumbs-el label="Executor" :to="`/executors/${params.executorId}`" />
      <q-breadcrumbs-el label="TaskDef" />
    </q-breadcrumbs>

    <div v-if="taskDef">
      <h5> TaskDef: {{params.taskDefId}}
        <q-btn
          dense flat icon="refresh" @click="refresh"
        />
      </h5>
      <div>
        Description: {{ taskDef.description}}
      </div>
      <div>
        Asset classes: {{ join(taskDef.assetClasses)}}
      </div>
      <q-table
        title="Parameters"
        :data="tableData"
        :columns="columns"
        row-key="name"
      />
    </div>

    <div v-else-if="!loading">
      Task Definition not found.
      <div class="q-ml-md">
        Executor: {{params.executorId}} <br/>
        Task Definition ID: {{params.taskDefId}}
      </div>
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
      taskDef: null,
      join: _.join,
      columns: [
        {
          field: 'name',
          name: 'name',
          label: 'Name',
          align: 'left',
          sortable: true
        },
        {
          field: 'type',
          name: 'type',
          label: 'Type',
          align: 'left',
          sortable: true
        },
        {
          field: 'defaultValue',
          name: 'defaultValue',
          label: 'Default',
          align: 'left',
          sortable: true
        },
        {
          field: 'required',
          name: 'required',
          label: 'Required'
        }
      ],
      tableData: []
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
      this.taskDef = null
      const url = `/executors/${this.params.executorId}/taskdefs/${this.params.taskDefId}`
      this.$axios({
        method: 'GET',
        url
      })
        .then(response => {
          this.loading = false
          console.log(`GET ${url}: response=`, response)
          this.taskDef = response.data || {}
          this.tableData = this.taskDef.parameters || []
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
