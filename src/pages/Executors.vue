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
      title="Executors"
      :data="executor"
      :columns="columns"
      row-key="name"
    >
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
  import executor from '../graphql/executors.gql'

  export default {
    components: {
      ExecutorNewButton
    },

    data() {
      return {
        executor: [],
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
        ]
      }
    },

    apollo: {
      executor
    },

    mounted() {
      this.refresh()
    },

    methods: {
      refresh() {
        // TODO
      },

      created(data) {
        this.executor.splice(0, 0, data)
      }
    }
  }
</script>
