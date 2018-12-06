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
        <executor-new-button v-on:created="executorCreated"/>
      </div>

      <q-td slot="body-cell-executorId" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link :to="`/executors/${encodeURIComponent(props.row.executorId)}`">
          {{props.row.executorId}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-actions" slot-scope="props" :props="props"
            style="width:5px"
      >
        <q-btn
          dense round
          icon="delete"
          color="negative"
          size="xs"
          @click.exact="deleteExecutor(props.row)"
          @click.shift.exact="doDeleteExecutor(props.row)"
        >
          <q-tooltip>Delete executor</q-tooltip>
        </q-btn>
      </q-td>

    </q-table>
  </q-page>
</template>

<script>
  import ExecutorNewButton from 'components/executor-new-button'
  import allExecutorsList from '../graphql/executors.gql'
  import executorDelete from '../graphql/executorDelete.gql'

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
          },
          {
            field: 'apiType',
            name: 'apiType',
            label: 'API Type',
            align: 'left',
            sortable: true
          },
          {
            field: 'actions',
            name: 'actions',
            label: 'Actions',
            align: 'right'
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

      executorCreated(executor) {
        if (debug) console.debug('executorCreated executor=', executor)
        this.refresh()
      },

      deleteExecutor(row) {
        this.$q.dialog({
          title: 'Confirm',
          message: `Are you sure you want to delete executor '${row.executorId}'` +
          ' and all associated entities?',
          color: 'negative',
          ok: `Yes, delete '${row.executorId}'`,
          cancel: true
        })
          .then(() => this.doDeleteExecutor(row))
          .catch(() => {
          })
      },

      doDeleteExecutor(row) {
        const mutation = executorDelete
        const variables = {
          input: {
            id: row.id
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('deleteExecutor: mutation data=', data)
            this.refresh()
            this.$q.notify(`${row.executorId} deleted.`)
          })
          .catch((error) => {
            console.error('deleteExecutor: mutation error=', error)
          })
      },
    },

    watch: {
      allExecutorsList(val) {
        if (debug) console.log('watch allExecutorsList=', val)
      }
    }

  }
</script>
