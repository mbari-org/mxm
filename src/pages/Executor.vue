<template>
  <q-page padding>
    <h5> Executor: {{executorId}}</h5>
    <div>
    </div>
    <q-table
      title="Tasks definitions"
      :data="tableData"
      :columns="columns"
      row-key="name"
    >
      <q-td slot="body-cell-button" slot-scope="props" :props="props"
            style="width:5px"
      >
        <q-btn
          dense round icon="arrow_forward"
          :to="`/executors/${executorId}/taskdefs/${props.row.taskDefId}`"
        />
      </q-td>
    </q-table>
  </q-page>
</template>

<script>
import lodash from 'lodash'
const _ = lodash

export default {
  data () {
    return {
      taskDefs: [],
      columns: [
        {
          field: 'taskDefId',
          name: 'ID',
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
        },
        {
          field: 'button',
          name: 'button',
          label: ''
        }
      ],
      tableData: []
    }
  },

  computed: {
    executorId () {
      return this.$route.params.executorId
    }
  },

  mounted () {
    this.getExecutor()
  },

  methods: {
    getExecutor () {
      const url = `/executors/${this.executorId}/detailed`
      this.$axios({
        method: 'GET',
        url
      })
        .then(response => {
          console.log(`GET ${url}: response=`, response)
          this.taskDefs = _.get(response, 'data.taskDefs') || []
          this.tableData = _.map(this.taskDefs, td => {
            td.assetClassesString = _.join(td.assetClasses)
            return td
          })
        })
        .catch(e => {
          console.error(e)
        })
    }
  }
}
</script>
