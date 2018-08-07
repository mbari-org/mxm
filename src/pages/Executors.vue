<template>
  <q-page padding>
    <q-table
      title="Executors"
      :data="tableData"
      :columns="columns"
      row-key="name"
    >
      <q-td slot="body-cell-button" slot-scope="props" :props="props"
            style="width:5px"
      >
        <q-btn
          dense round icon="arrow_forward"
          :to="`/executors/${props.row.executorId}`"
        />
      </q-td>
    </q-table>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      executors: [],
      columns: [
        {
          field: 'executorId',
          name: 'ID',
          label: 'ID',
          align: 'left',
          sortable: true
        },
        {
          field: 'httpEndpoint',
          name: 'httpEndpoint',
          label: 'httpEndpoint',
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

  mounted () {
    this.getExecutors()
  },

  methods: {
    getExecutors () {
      const url = `/executors`
      this.$axios({
        method: 'GET',
        url: '/executors'
      })
        .then(response => {
          console.log(`GET ${url}: response=`, response)
          this.executors = response.data || []
          this.tableData = this.executors
        })
        .catch(e => {
          console.error(e)
        })
    }
  }
}
</script>
