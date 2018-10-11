<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Executors" to="/executors"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/executors/${encodeURIComponent(params.executorId)}`"/>
      <q-breadcrumbs-el label="TaskDefs"/>
      <q-breadcrumbs-el :label="params.taskDefId"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshTaskDef"
      />
    </q-breadcrumbs>

    <div v-if="taskDef">

      <q-card class="q-mb-md">
        <q-card-title>
          Task Definition: {{ params.taskDefId }}
        </q-card-title>
        <q-card-separator />
        <q-card-main>
          <p class="text-italic">
            {{ taskDef.description }}
          </p>
        </q-card-main>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-main>
          Associated asset classes:
          <div class="row">
            <q-chip
              class="col-auto q-mr-sm"
              v-for="c in myAssetClasses"
              :key="c.assetClassName"
              color="secondary"
              small
              closable
              @hide="removeAssetClass(c.nodeId)"
            >
              {{c.assetClassName}}
              <q-tooltip>
                {{c.assetClassByAssetClassName.description}}
              </q-tooltip>
            </q-chip>

            <asset-class-select-button
              class="col-auto q-ml-md"
              :exclude="myAssetClassNames"
              v-on:selection="assetClassSelection"
            />
          </div>

        </q-card-main>
      </q-card>

      <q-table
        title="Parameters"
        :data="myParameters"
        :columns="columns"
        row-key="name"
      >
        <div slot="top-right" slot-scope="props" class="fit">
          <parameter-new-button
            :executor-id="params.executorId"
            :task-def-id="params.taskDefId"
            v-on:created="parameterCreated"
          />
        </div>

      </q-table>
    </div>

    <div v-else-if="!loading">
      Task Definition not found.
      <div class="q-ml-md">
        Executor: {{params.executorId}} <br/>
        Task Definition ID: {{params.taskDefId}}
      </div>
    </div>

  </q-page>
</template>

<script>
  import taskDef from '../graphql/taskDef.gql'
  import AssetClassSelectButton from 'components/asset-class-select-button'
  import taskDefAssetClassInsert from '../graphql/taskDefAssetClassInsert.gql'
  import taskDefAssetClassDelete from '../graphql/taskDefAssetClassDelete.gql'
  import ParameterNewButton from 'components/parameter-new-button'
  import { Notify } from 'quasar'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      AssetClassSelectButton,
      ParameterNewButton
    },

    data() {
      return {
        loading: false,
        taskDef: null,
        join: _.join,
        columns: [
          {
            field: 'name',
            name: 'name',
            label: 'Name',
            align: 'left',
            sortable: true
          },
          {
            field: 'type',
            name: 'type',
            label: 'Type',
            align: 'left',
            sortable: true
          },
          {
            field: 'required',
            name: 'required',
            label: 'Required'
          },
          {
            field: 'defaultValue',
            name: 'defaultValue',
            label: 'Default',
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

      myAssetClasses () {
        return this.taskDef && this.taskDef.taskdefAssetClassesByExecutorIdAndTaskDefIdList || []
      },

      myAssetClassNames () {
        return _.map(this.myAssetClasses, "assetClassName")
      },

      myParameters () {
        return this.taskDef && this.taskDef.parametersByExecutorIdAndTaskDefIdList || []
      },
    },

    apollo: {
      taskDef: {
        query: taskDef,
        variables () {
          return {
            executorId: this.params.executorId,
            taskDefId: this.params.taskDefId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          if (data.taskDefByExecutorIdAndTaskDefId) {
            return data.taskDefByExecutorIdAndTaskDefId
          }
          else return null
        },
      },
    },

    mounted () {
      this.refreshTaskDef()
    },

    methods: {
      refreshTaskDef () {
        this.$apollo.queries.taskDef.refetch()
      },

      assetClassSelection (data) {
        const newAssetClassNames = _.difference(data, this.myAssetClassNames)
        if (debug) console.debug('assetClassSelection: newAssetClassNames=', newAssetClassNames)

        const added = []
        const next = () => {
          const assetClassName = newAssetClassNames.pop()
          if (assetClassName) {
            if (debug) console.debug('assetClassSelection: next=', assetClassName)
            this.addAssetClassName(assetClassName, ok => {
              if (ok) {
                added.push(assetClassName)
              }
              next()
            })
          }
          else {
            if (added.length) {
              Notify.create({
                message: `Asset associated (${added.length})`,
                timeout: 1000,
                type: 'info'
              })
              this.refreshTaskDef()
            }
          }
        }

        next()
      },

      addAssetClassName (assetClassName, next) {
        const mutation = taskDefAssetClassInsert
        const variables = {
          executorId: this.params.executorId,
          taskDefId: this.params.taskDefId,
          assetClassName
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            next(true)
          })
          .catch((error) => {
            console.error('mutation error=', error)
            next(false)
          })
      },

      removeAssetClass (nodeId) {
        if (debug) console.debug('removeAssetClass: nodeId=', nodeId)

        const mutation = taskDefAssetClassDelete
        const variables = {
          nodeId
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (data.data) {
              this.refreshTaskDef()
            }
          })
          .catch((error) => {
            console.error('mutation error=', error)
          })
      },

      parameterCreated (data) {
        this.refreshTaskDef()
      }
    },

    watch: {
      '$route'() {
        this.refreshTaskDef()
      }
    }
  }
</script>
