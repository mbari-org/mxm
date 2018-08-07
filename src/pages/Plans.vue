<template>
  <q-page class="q-pa-md">
    <q-table
      title="Plans"
      :data="tableData"
      :columns="columns"
      row-key="name"
    >
      <template slot="top-right" slot-scope="props">
        <q-btn
          dense flat icon="refresh" @click="refresh"
        />
      </template>

      <q-td slot="body-cell-button" slot-scope="props" :props="props"
            style="width:5px"
      >
        <q-btn
          dense round icon="arrow_forward"
          :to="`/plans/${props.row.planId}`"
        />
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
