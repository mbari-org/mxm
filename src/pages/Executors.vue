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
      :data="executors"
      :columns="columns"
      row-key="name"
    >
      <div slot="top-right" slot-scope="props" class="fit">
        <executor-new-button :created="created"/>
      </div>

      <q-td slot="body-cell-executorId" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link :to="`/executors/${encodeURIComponent(props.row.executorId)}`">
          {{props.row.executorId}}
        </router-link>
      </q-td>

    </q-table>
  </q-page>
</template>

<script>
import ExecutorNewButton from 'components/executor-new-button'

export default {
  components: {
    ExecutorNewButton
  },

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
          field: 'description',
          name: 'description',
          label: 'Description',
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
      ]
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
        })
        .catch(e => {
          console.error(e)
        })
    },

    created (data) {
      this.executors.splice(0, 0, data)
    }
  }
}
</script>
