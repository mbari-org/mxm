<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el label="Executors" to="/executors" />
      <q-breadcrumbs-el :label="params.executorId" :to="`/executors/${params.executorId}`" />
      <q-breadcrumbs-el label="TaskDefs" />
      <q-breadcrumbs-el :label="params.taskDefId" />
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refresh"
      />
    </q-breadcrumbs>

    <div v-if="taskDef">

      <h5> Task Definition: {{ params.taskDefId }}
      </h5>

      <div>
        Description: {{ taskDef.description }}
      </div>

      <div>
        Asset classes: {{ join(taskDef.assetClasses) }}
      </div>

      <q-table
        title="Parameters"
        :data="tableData"
        :columns="columns"
        row-key="name"
      >
        <div slot="top-right" slot-scope="props" class="fit">
          <parameter-new-button
            :executor-id="params.executorId"
            :taskdef-id="params.taskDefId"
            :created="created"
          />
        </div>

      </q-table>
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
import ParameterNewButton from 'components/parameter-new-button'
import lodash from 'lodash'
const _ = lodash

export default {
  components: {
    ParameterNewButton
  },

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
          field: 'required',
          name: 'required',
          label: 'Required'
        },
        {
          field: 'defaultValue',
          name: 'defaultValue',
          label: 'Default',
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
    },

    created (data) {
      this.tableData.splice(0, 0, data)
    }
  },

  watch: {
    '$route' () {
      this.refresh()
    }
  }
}
</script>
