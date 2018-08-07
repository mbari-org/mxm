<template>
  <q-page class="q-pa-md">
    <h5> TaskDef: {{params.taskDefId}}</h5>
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
  </q-page>
</template>

<script>
import lodash from 'lodash'
const _ = lodash

export default {
  data () {
    return {
      taskDef: {},
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
    this.getTaskDef()
  },

  methods: {
    getTaskDef () {
      const url = `/executors/${this.params.executorId}/taskdefs/${this.params.taskDefId}`
      this.$axios({
        method: 'GET',
        url
      })
        .then(response => {
          console.log(`GET ${url}: response=`, response)
          this.taskDef = response.data || {}
          this.tableData = this.taskDef.parameters || []
        })
        .catch(e => {
          console.error(e)
        })
    }
  }
}
</script>
