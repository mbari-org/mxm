<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el label="Plans" to="/plans" />
      <q-breadcrumbs-el label="Plan" :to="`/plans/${params.planId}`" />
      <q-breadcrumbs-el label="Task" :to="`/plans/${params.planId}/tasks/${params.taskId}`" />
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refresh"
      />
    </q-breadcrumbs>

    <div v-if="task">
      <h5> Task for definition: {{ task.taskDefId }}
      </h5>
      <small>Plan: {{ params.planId }}</small>

      <div>
        Task ID: {{ task.taskId }}
      </div>

      <div>
        Task Name: {{ task.name }}
      </div>

      <div>
        Description: {{ task.description }}
      </div>

      <div>
        executorId: {{ task.executorId }}
      </div>

      <div>
        Asset ID: {{ task.assetId }}
      </div>

      <div>
        Start: {{ task.start }}
      </div>

      <div>
        End: {{ task.end }}
      </div>

      <q-table
        title="Arguments"
        :data="tableData"
        :columns="columns"
        row-key="name"
      />
    </div>

    <div v-else-if="!loading">
      Plan/Task not found: {{params.planId}} / {{params.taskId}}
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
      task: null,
      join: _.join,
      columns: [
        {
          field: 'paramName',
          name: 'paramName',
          label: 'Parameter',
          align: 'left',
          sortable: true
        },
        {
          field: 'paramValue',
          name: 'paramValue',
          label: 'Value',
          align: 'left',
          sortable: true
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
      this.task = null
      const url = `/plans/${this.params.planId}/tasks/${this.params.taskId}`
      this.$axios({
        method: 'GET',
        url
      })
        .then(response => {
          this.loading = false
          console.log(`GET ${url}: response=`, response)
          this.task = response.data || {}
          this.tableData = this.task.arguments || []
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
