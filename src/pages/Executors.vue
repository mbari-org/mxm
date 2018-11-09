<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Executors" to="/executors"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refresh"
      />
    </q-breadcrumbs>

    <q-table
      :data="allExecutorsList"
      :columns="columns"
      row-key="name"
      :rows-per-page-options="rowsPerPage"
      :pagination.sync="pagination"
      :filter="filter"
    >
      <div slot="top-left" slot-scope="props" class="row items-center">
        <div class="col-auto q-headline">
          Executors
        </div>

        <div class="q-ml-md row">
          <q-search
            v-if="allExecutorsList.length"
            class="col"
            color="secondary"
            v-model="filter"
            placeholder="Filter"
            clearable
          />
        </div>
      </div>

      <div slot="top-right" slot-scope="props" class="fit">
        <executor-new-button v-on:created="created"/>
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
  import allExecutorsList from '../graphql/executors.gql'

  const debug = false

  export default {
    components: {
      ExecutorNewButton
    },

    data() {
      return {
        allExecutorsList: [],
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
            label: 'Endpoint',
            align: 'left',
            sortable: true
          }
        ],
        rowsPerPage: [0],
        pagination: {
          rowsPerPage: 0
        },
        filter: '',
      }
    },

    apollo: {
      allExecutorsList
    },

    mounted() {
      this.refresh()
    },

    methods: {
      refresh() {
        this.$apollo.queries.allExecutorsList.refetch()
      },

      created(data) {
        this.allExecutorsList.splice(0, 0, data)
      }
    },

    watch: {
      allExecutorsList(val) {
        if (debug) console.log('watch allExecutorsList=', val)
      }
    }

  }
</script>
