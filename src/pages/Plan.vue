<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Plans" to="/plans"/>
      <q-breadcrumbs-el :label="params.planId" :to="`/plans/${encodeURIComponent(params.planId)}`"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshPlan"
      />
    </q-breadcrumbs>

    <div v-if="plan">

      <q-card class="q-mb-md">
        <q-card-title>
          Plan: {{plan.name}}
          <small>({{plan.planId}})</small>
        </q-card-title>
        <q-card-separator/>
        <q-card-main>
          <p class="text-italic">
            {{plan.description}}
          </p>
        </q-card-main>
      </q-card>

      <!--<pre>myTasks={{myTasks}}</pre>-->

      <q-table
        title="Tasks"
        :data="myTasks"
        :columns="taskColumns"
        row-key="name"
      >
        <div slot="top-right" slot-scope="props" class="fit">
          <task-new-button
            :plan-id="plan.planId"
            v-on:created="taskCreated"
          />
        </div>

        <q-td slot="body-cell-name" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link :to="`/plans/${encodeURIComponent(plan.planId)}/tasks/${encodeURIComponent(props.row.taskId)}`">
            {{props.row.name || props.row.taskDefId || props.row.taskId}}
          </router-link>
        </q-td>

        <q-td slot="body-cell-executorId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link :to="`/executors/${encodeURIComponent(props.value)}`">
            {{ props.value }}
          </router-link>
        </q-td>

        <q-td slot="body-cell-taskDefId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link
            :to="`/executors/${encodeURIComponent(props.row.executorId)}/taskdefs/${encodeURIComponent(props.value)}`">
            {{ props.value }}
          </router-link>
        </q-td>

      </q-table>

    </div>

    <div v-else-if="!loading">
      Plan not found: {{params.planId}}
    </div>
  </q-page>
</template>

<script>
  import plan from '../graphql/plan.gql'
  import TaskNewButton from 'components/task-new-button'
  import {Notify} from 'quasar'
  import _ from 'lodash'

  const debug = true

  export default {
    components: {
      TaskNewButton
    },

    data() {
      return {
        loading: false,
        plan: null,
        taskColumns: [
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
            field: 'executorId',
            name: 'executorId',
            label: 'Executor',
            align: 'left',
            sortable: true
          },
          {
            field: 'taskDefId',
            name: 'taskDefId',
            label: 'TaskDef',
            align: 'left',
            sortable: true
          },
          {
            field: 'assetId',
            name: 'assetId',
            label: 'Asset',
            align: 'left',
            sortable: true
          },
          {
            field: 'start',
            name: 'start',
            label: 'Start',
            align: 'left',
            sortable: true
          },
          {
            field: 'end',
            name: 'end',
            label: 'End',
            align: 'left',
            sortable: true
          },
          {
            field: 'geometry',
            name: 'geometry',
            label: 'Geometry',
            align: 'left',
            sortable: false
          },
        ]
      }
    },

    computed: {
      params() {
        return this.$route.params
      },

      myTasks() {
        return _.get(this.plan, 'tasksByPlanIdList') || []
      },
    },

    apollo: {
      plan: {
        query: plan,
        variables() {
          return {
            planId: this.params.planId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          if (data.allPlansList && data.allPlansList.length) {
            return data.allPlansList[0]
          }
          else return null
        },
      },
    },

    mounted() {
      this.refreshPlan()
    },

    methods: {
      refreshPlan() {
        this.$apollo.queries.plan.refetch()
      },

      taskCreated(data) {
        this.refreshPlan()
      }
    },

    watch: {
      '$route'() {
        this.refreshPlan()
      },

      plan(val) {
        if (debug) console.log('watch plan=', val)
      },

      executor(val) {
        if (debug) console.log('watch executor=', val)
      },
    }
  }
</script>
