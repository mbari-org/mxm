<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Tasks" to="/tasks"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshTasks"
      />
    </q-breadcrumbs>

    <q-table
      title="Tasks"
      :data="allTasksList"
      :columns="columns"
      row-key="name"
    >
      <div slot="top-right" slot-scope="props" class="fit">
        <task-new-button v-on:created="taskCreated"/>
      </div>

      <q-td slot="body-cell-name" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link :to="`/tasks/${encodeURIComponent(props.row.taskId)}`">
          {{props.row.name}}
        </router-link>
      </q-td>

    </q-table>
  </q-page>
</template>

<script>
  import TaskNewButton from 'components/task-new-button'
  import allTasksList from '../graphql/tasks.gql'

  const debug = false

  export default {
    components: {
      TaskNewButton
    },

    data() {
      return {
        allTasksList: [],
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
        ]
      }
    },

    apollo: {
      allTasksList,
    },

    mounted() {
      this.refreshTasks()
    },

    methods: {
      refreshTasks() {
        this.$apollo.queries.allTasksList.refetch()
      },

      taskCreated(data) {
        this.refreshTasks()
      }
    },

    watch: {
      allTasksList(val) {
        if (debug) console.log('watch allTasksList=', val)
      }
    }
  }
</script>
