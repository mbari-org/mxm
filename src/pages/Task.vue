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

      <q-card class="q-mb-md">
        <q-card-title>
          Task: '{{ task.taskId }}'
        </q-card-title>
        <q-card-separator/>
        <q-card-main>
          <table>
            <tbody>
            <tr>
              <td>Task Def:</td>
              <td>{{ task.taskDefId }}</td>
            </tr>
            <tr>
              <td>Task Name:</td>
              <td>{{ task.name }}</td>
            </tr>
            <tr>
              <td>Description:</td>
              <td>
                <p class="text-italic">
                  {{ task.description }}
                </p>
              </td>
            </tr>
            <tr>
              <td>Executor:</td>
              <td>{{ task.executorId }}</td>
            </tr>
            <tr>
              <td>Asset:</td>
              <td>{{ task.assetId }}</td>
            </tr>
            <tr v-if="task.start">
              <td>Start:</td>
              <td>{{ task.start }}</td>
            </tr>
            <tr v-if="task.end">
              <td>End:</td>
              <td>{{ task.end }}</td>
            </tr>
            </tbody>
          </table>
        </q-card-main>
      </q-card>

      <q-search
        v-if="myArguments"
        class="col-10"
        color="secondary"
        v-model="filter"
        placeholder="Filter"
        clearable
      />
      <q-table
        title="Arguments"
        :data="myArguments"
        :columns="argColumns"
        row-key="paramName"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
      >
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td key="paramName" :props="props"
                style="width:5px"
          >
            <div class="text-bold">
              {{ props.row.paramName }}
            </div>
          </q-td>

          <q-td key="paramValue" :props="props"
                style="width:5px"
          >
            <!--NOTE: comparing string versions-->
            <div v-if="`${props.row.paramValue}` !== `${props.row.defaultValue}`">
              <span class="bg-cyan-2 text-bold q-pa-sm">
                {{ props.row.paramValue }}
              </span>
              <q-tooltip>
                Default value:
                <span class="text-bold">{{props.row.defaultValue}}</span>
              </q-tooltip>
            </div>
            <div v-else>
              {{ props.row.paramValue }}
            </div>

            <q-popup-edit
              v-model="props.row.paramValue"
              :title="`${props.row.paramName}`"
              buttons
              :validate="validateValue"
            >
              <q-field>
                <q-input
                  v-model.trim="props.row.paramValue"
                  clearable
                  :clear-value="props.row.defaultValue"
                  type="number"
                  :error="!props.row.paramValue"
                />
              </q-field>
            </q-popup-edit>
          </q-td>

          <q-td key="type" :props="props"
                style="width:5px"
          >
            {{ props.row.type }}
          </q-td>

          <q-td key="description" :props="props"
          >
            {{ props.row.description }}
          </q-td>

        </q-tr>

      </q-table>
    </div>

    <div v-else-if="!loading" class="text-negative">
      Task not found: '{{params.taskId}}'
    </div>
  </q-page>
</template>

<script>
  import task from '../graphql/task.gql'
  import Vue from 'vue'
  import _ from 'lodash'

  const debug = true

  export default {
    data() {
      return {
        loading: false,
        task: null,
        myArguments: [],
        argColumns: [
          {
            field: 'paramName',
            name: 'paramName',
            label: 'Parameter',
            align: 'left',
          },
          {
            field: 'paramValue',
            name: 'paramValue',
            label: 'Value',
            align: 'left',
          },
          {
            field: 'type',
            name: 'type',
            label: 'Type',
            align: 'left',
          },
          {
            field: 'description',
            name: 'description',
            label: 'Description',
            align: 'left',
          }
        ],
        rowsPerPage: [0],
        pagination: {
          rowsPerPage: 0
        },
        filter: '',
      }
    },

    computed: {
      params() {
        return this.$route.params
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
          let res = null
          if (debug) console.log('update: data=', data)
          if (data.taskByPlanIdAndTaskId) {
            res = data.taskByPlanIdAndTaskId
          }
          Vue.nextTick(() => {
            this.setMyArguments(res)
          })
          return res
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

      argumentCreated() {
        this.refreshTask()
      },

      setMyArguments(task) {
        console.debug('setMyArguments task=', task)
        const explicitArguments = _.get(task, 'argumentsByPlanIdAndTaskIdList') || []
        const parameters = _.get(task, 'taskDefByExecutorIdAndTaskDefId.parametersByExecutorIdAndTaskDefIdList') || []

        console.debug('explicitArguments=', explicitArguments)

        this.myArguments = _.map(parameters, p => {
          const arg = _.find(explicitArguments, {paramName: p.name})
          const paramValue = arg && arg.paramValue || p.defaultValue
          console.debug('FIND p.name=', p.name, 'arg=', arg, 'paramValue=', paramValue)
          return {
            paramName: p.name,
            type: p.type,
            paramValue,
            defaultValue: p.defaultValue,
            description: p.description,
          }
        })
      },

      validateValue(val) {
        console.debug('validateValue val=', val)
        return !!val
      }
    },

    watch: {
      '$route'() {
        this.refreshTask()
      }
    }
  }
</script>
