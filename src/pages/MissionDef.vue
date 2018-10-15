<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Executors" to="/executors"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/executors/${encodeURIComponent(params.executorId)}`"/>
      <q-breadcrumbs-el label="MissionDefs"/>
      <q-breadcrumbs-el :label="params.missionDefId"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshMissionDef"
      />
    </q-breadcrumbs>

    <div v-if="missionDef">

      <q-card class="q-mb-md">
        <q-card-title>
          Mission Definition: {{ params.missionDefId }}
        </q-card-title>
        <q-card-separator/>
        <q-card-main>
          <p class="text-italic">
            {{ missionDef.description }}
          </p>
        </q-card-main>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-main>
          Associated asset classes:
          <div class="row q-mt-sm">
            <q-chip
              class="col-auto q-mr-sm shadow-5"
              v-for="c in myAssetClasses"
              :key="c.assetClassName"
              color="secondary"
              small
              closable
              @hide="removeAssetClass(c.nodeId)"
            >
              <router-link
                style="color:white;text-decoration:none"
                :to="`/assetclasses/${encodeURIComponent(c.assetClassName)}`"
              >
                {{c.assetClassName}}
              </router-link>
              <q-tooltip v-if="c.assetClassByAssetClassName.description">
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
            :mission-def-id="params.missionDefId"
            v-on:created="parameterCreated"
          />
        </div>

      </q-table>
    </div>

    <div v-else-if="!loading">
      Mission Definition not found.
      <div class="q-ml-md">
        Executor: {{params.executorId}} <br/>
        Mission Definition ID: {{params.missionDefId}}
      </div>
    </div>

  </q-page>
</template>

<script>
  import missionDef from '../graphql/missionDef.gql'
  import AssetClassSelectButton from 'components/asset-class-select-button'
  import missionDefAssetClassInsert from '../graphql/missionDefAssetClassInsert.gql'
  import missionDefAssetClassDelete from '../graphql/missionDefAssetClassDelete.gql'
  import ParameterNewButton from 'components/parameter-new-button'
  import {Notify} from 'quasar'
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
        missionDef: null,
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

      myAssetClasses() {
        return this.missionDef && this.missionDef.missionDefAssetClassesByExecutorIdAndMissionDefIdList || []
      },

      myAssetClassNames() {
        return _.map(this.myAssetClasses, "assetClassName")
      },

      myParameters() {
        return this.missionDef && this.missionDef.parametersByExecutorIdAndMissionDefIdList || []
      },
    },

    apollo: {
      missionDef: {
        query: missionDef,
        variables() {
          return {
            executorId: this.params.executorId,
            missionDefId: this.params.missionDefId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          if (data.missionDefByExecutorIdAndMissionDefId) {
            return data.missionDefByExecutorIdAndMissionDefId
          }
          else return null
        },
      },
    },

    mounted() {
      this.refreshMissionDef()
    },

    methods: {
      refreshMissionDef() {
        this.$apollo.queries.missionDef.refetch()
      },

      assetClassSelection(data) {
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
              this.refreshMissionDef()
            }
          }
        }

        next()
      },

      addAssetClassName(assetClassName, next) {
        const mutation = missionDefAssetClassInsert
        const variables = {
          executorId: this.params.executorId,
          missionDefId: this.params.missionDefId,
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

      removeAssetClass(nodeId) {
        if (debug) console.debug('removeAssetClass: nodeId=', nodeId)

        const mutation = missionDefAssetClassDelete
        const variables = {
          nodeId
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (data.data) {
              this.refreshMissionDef()
            }
          })
          .catch((error) => {
            console.error('mutation error=', error)
          })
      },

      parameterCreated(data) {
        this.refreshMissionDef()
      }
    },

    watch: {
      '$route'() {
        this.refreshMissionDef()
      }
    }
  }
</script>
