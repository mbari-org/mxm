<template>
  <q-page class="q-pa-md">
    <h5> Executor: {{params.executorId}}</h5>

    <q-table
      title="Assets"
      :columns="assetColumns"
      :data="assetTable"
      row-key="name"
      class="q-mb-md"
    >
      <q-td slot="body-cell-button" slot-scope="props" :props="props"
            style="width:5px"
      >
        <q-btn
          dense round icon="arrow_forward"
          :to="`/executors/${params.executorId}/taskdefs/${props.row.taskDefId}`"
        />
      </q-td>
    </q-table>

    <q-table
      title="Tasks definitions"
      :columns="taskDefColumns"
      :data="taskDefTable"
      row-key="name"
    >
      <q-td slot="body-cell-button" slot-scope="props" :props="props"
            style="width:5px"
      >
        <q-btn
          dense round icon="arrow_forward"
          :to="`/executors/${params.executorId}/taskdefs/${props.row.taskDefId}`"
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
      taskDefTable: []
    }
  },

  computed: {
    params () {
      return this.$route.params
    }
  },

  mounted () {
    this.getExecutor()
  },

  methods: {
    getExecutor () {
      const url = `/executors/${this.params.executorId}/detailed`
      this.$axios({
        method: 'GET',
        url
      })
        .then(response => {
          console.log(`GET ${url}: response=`, response)
          this.assetTable = _.get(response, 'data.assets') || []
          this.taskDefs = _.get(response, 'data.taskDefs') || []
          this.taskDefTable = _.map(this.taskDefs, td => {
            td.assetClassesString = _.join(td.assetClasses)
            return td
          })
        })
        .catch(e => {
          console.error(e)
        })
    }
  },

  watch: {
    '$route' (to, from) {
      console.log('$route: to=', to, 'from=', from)
    }
  }
}
</script>
