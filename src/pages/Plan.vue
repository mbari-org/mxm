<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/" />
      <q-breadcrumbs-el label="Plans" to="/plans" />
      <q-breadcrumbs-el label="Plan" :to="`/plans/${encodeURIComponent(params.planId)}`" />
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refresh"
      />
    </q-breadcrumbs>

    <div v-if="plan">
      <h5> Plan: {{plan.name}}
      </h5>
      <small>{{plan.planId}}</small>

      <div>
        Description: {{ plan.description}}
      </div>

      <q-table
        title="Tasks"
        :data="plan.tasks"
        :columns="taskColumns"
        row-key="name"
      >
        <div slot="top-right" slot-scope="props" class="fit">
          <task-new-button
            :plan-id="plan.planId"
            v-on:created="created"
          />
        </div>

        <q-td slot="body-cell-name" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link :to="`/plans/${encodeURIComponent(plan.planId)}/tasks/${encodeURIComponent(props.row.taskId)}`">
            {{props.row.name || props.row.taskDefId || props.row.taskId}}</router-link>
        </q-td>

        <q-td slot="body-cell-executorId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link :to="`/executors/${encodeURIComponent(props.value)}`">
            {{ props.value }}</router-link>
        </q-td>

        <q-td slot="body-cell-taskDefId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link :to="`/executors/${encodeURIComponent(props.row.executorId)}/taskdefs/${encodeURIComponent(props.value)}`">
            {{ props.value }}</router-link>
        </q-td>

        <q-td slot="body-cell-assetId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link :to="`/executors/${encodeURIComponent(props.row.executorId)}/assets/${encodeURIComponent(props.value)}`">
            {{ props.value }}</router-link>
        </q-td>

        <q-td slot="body-cell-arguments" slot-scope="props" :props="props"
              style="width:5px"
        >
          {{ (props.value || []).length }}
        </q-td>

      </q-table>

    </div>

    <div v-else-if="!loading">
      Plan not found: {{params.planId}}
    </div>
  </q-page>
</template>

<script>
import TaskNewButton from 'components/task-new-button'
import lodash from 'lodash'
const _ = lodash

export default {
  components: {
    TaskNewButton
  },

  data () {
    return {
      loading: false,
      plan: null,
      join: _.join,
      taskColumns: [
        {
          field: 'name',
          name: 'name',
          label: 'Name',
          align: 'left',
          sortable: true
        },
        {
          field: 'executorId',
          name: 'executorId',
          label: 'executorId',
          align: 'left',
          sortable: true
        },
        {
          field: 'taskDefId',
          name: 'taskDefId',
          label: 'taskDefId',
          align: 'left',
          sortable: true
        },
        {
          field: 'arguments',
          name: 'arguments',
          label: 'arguments',
          align: 'left',
          sortable: true
        },
        {
          field: 'assetId',
          name: 'assetId',
          label: 'assetId',
          align: 'left',
          sortable: true
        },
        {
          field: 'start',
          name: 'start',
          label: 'start',
          align: 'left',
          sortable: true
        },
        {
          field: 'end',
          name: 'end',
          label: 'end',
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

  computed: {
    params () {
      return this.$route.params
    }
  },

  mounted () {
    this.refresh()
  },

  methods: {
    refresh () {
      this.loading = true
      this.plan = null
      const url = `/plans/${encodeURIComponent(this.params.planId)}`
      this.$axios({
        method: 'GET',
        url
      })
        .then(response => {
          this.loading = false
          console.log(`GET ${url}: response=`, response)
          this.plan = response.data || {}
          if (!this.plan.tasks) {
            this.plan.tasks = []
          }
        })
        .catch(e => {
          this.loading = false
          console.error(e)
        })
    },

    created (data) {
      this.plan.tasks.splice(0, 0, data)
    }
  },

  watch: {
    '$route' () {
      this.refresh()
    }
  }
}
</script>
