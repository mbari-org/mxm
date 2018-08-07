<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el label="Plans" to="/plans" />
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refresh"
      />
    </q-breadcrumbs>

    <q-table
      title="Plans"
      :data="tableData"
      :columns="columns"
      row-key="name"
    >
      <q-td slot="body-cell-name" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link :to="`/plans/${props.row.planId}`">
          {{props.row.name}}
        </router-link>
      </q-td>

    </q-table>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      plans: [],
      columns: [
        {
          field: 'name',
          name: 'name',
          label: 'Name',
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

  mounted () {
    this.refresh()
  },

  methods: {
    refresh () {
      const url = `/plans`
      this.$axios({
        method: 'GET',
        url: '/plans'
      })
        .then(response => {
          console.log(`GET ${url}: response=`, response)
          this.plans = response.data || []
          this.tableData = this.plans
        })
        .catch(e => {
          console.error(e)
        })
    }
  }
}
</script>
