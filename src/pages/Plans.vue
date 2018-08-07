<template>
  <q-page class="q-pa-md">
    <q-table
      title="Plans"
      :data="tableData"
      :columns="columns"
      row-key="name"
    />
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      plans: [],
      columns: [
        {
          field: 'planId',
          name: 'ID',
          label: 'ID',
          align: 'left',
          sortable: true
        },
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
    this.getPlans()
  },

  methods: {
    getPlans () {
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
