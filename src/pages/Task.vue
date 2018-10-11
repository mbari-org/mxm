<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Plans" to="/plans"/>
      <q-breadcrumbs-el :label="params.planId" :to="`/plans/${encodeURIComponent(params.planId)}`"/>
      <q-breadcrumbs-el label="Tasks"/>
      <q-breadcrumbs-el :label="params.taskId"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshTask"
      />
    </q-breadcrumbs>

    <div v-if="task">

      <!--<pre>task={{task}}</pre>-->

      <h5> '{{ task.taskDefId }}' Task Instance
      </h5>
      <small>Plan: {{ params.planId }}</small>

      <div>
        Task ID: {{ task.taskId }}
      </div>

      <div>
        Task Name: {{ task.name }}
      </div>

      <div>
        Description: {{ task.description }}
      </div>

      <div>
        executorId: {{ task.executorId }}
      </div>

      <div>
        Asset ID: {{ task.assetId }}
      </div>

      <div>
        Start: {{ task.start }}
      </div>

      <div>
        End: {{ task.end }}
      </div>

      <q-table
        title="Arguments"
        :data="myArguments"
        :columns="argColumns"
        row-key="name"
      >
        <div slot="top-right" slot-scope="props" class="fit">
          <!--v-if="parameters.length"-->
          <argument-new-button
            :plan-id="params.planId"
            :task-id="params.taskId"
            :executor-id="task.executorId"
            :task-def-id="task.taskDefId"
            :parameters="parameters"
            v-on:created="argumentCreated"
          />
        </div>
      </q-table>
    </div>

    <div v-else-if="!loading">
      Plan/Task not found: {{params.planId}} / {{params.taskId}}
    </div>
  </q-page>
</template>

<script>
  import ArgumentNewButton from 'components/argument-new-button'
  import task from '../graphql/task.gql'

  const debug = true

  export default {
    components: {
      ArgumentNewButton,
    },

    data() {
      return {
        loading: false,
        task: null,
        argColumns: [
          {
            field: 'paramName',
            name: 'paramName',
            label: 'Parameter',
            align: 'left',
            sortable: true
          },
          {
            field: 'paramValue',
            name: 'paramValue',
            label: 'Value',
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
      }
    },

    computed: {
      params() {
        return this.$route.params
      },

      myArguments() {
        const list = _.get(this.task, 'argumentsByPlanIdAndTaskIdList') || []
        return list
      },

      parameters() {
        const all = _.get(this.task, 'taskDefByExecutorIdAndTaskDefId.parametersByExecutorIdAndTaskDefIdList') || []
        const myArgNames = _.map(this.myArguments, 'paramName')
        return _.filter(all, p => !_.includes(myArgNames, p.name))
      },
    },

    apollo: {
      task: {
        query: task,
        variables() {
          return {
            planId: this.params.planId,
            taskId: this.params.taskId,
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          if (data.taskByPlanIdAndTaskId) {
            return data.taskByPlanIdAndTaskId
          }
          else return null
        },
      },
    },

    mounted() {
      this.refreshTask()
    },

    methods: {
      refreshTask() {
        this.$apollo.queries.task.refetch()
      },

      argumentCreated(data) {
        this.refreshTask()
      }
    },

    watch: {
      '$route'() {
        this.refreshTask()
      }
    }
  }
</script>
