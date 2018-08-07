<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el label="Executors" to="/executors" />
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refresh"
      />
    </q-breadcrumbs>

    <q-table
      title="Executors"
      :data="tableData"
      :columns="columns"
      row-key="name"
    >
      <q-td slot="body-cell-executorId" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link :to="`/executors/${props.row.executorId}`">
          {{props.row.executorId}}
        </router-link>
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
          name: 'executorId',
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
        }
      ],
      tableData: []
    }
  },

  mounted () {
    this.refresh()
  },

  methods: {
    refresh () {
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
