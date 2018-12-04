<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Executors" to="/executors"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/executors/${encodeURIComponent(params.executorId)}`"/>
      <q-breadcrumbs-el label="MissionDefs" :to="`/executors/${encodeURIComponent(params.executorId)}/missiondefs`"/>
      <q-breadcrumbs-el :label="params.missionDefId"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshMissionDef"
      />
    </q-breadcrumbs>

    <div v-if="missionDef">

      <q-card class="q-mb-md">
        <q-card-title>
          Mission Definition:
          <span class="text-bold">
            {{ params.missionDefId }}
          <q-popup-edit
            v-model="missionDef.missionDefId"
            title="Mission Definition ID"
            buttons
            @save="updateMissionDefId"
          >
            <q-field>
              <q-input
                v-model.trim="missionDef.missionDefId"
                clearable
                class="bg-green-1"
              />
            </q-field>
          </q-popup-edit>
          </span>
        </q-card-title>
        <q-card-separator/>
        <q-card-main>
          <pxs-markdown :text="missionDef.description"/>
          <q-popup-edit
            v-model="missionDef.description"
            title="Description"
            buttons
            @save="updateDescription"
          >
            <q-field>
              <q-input
                v-model.trim="missionDef.description"
                clearable
                class="bg-green-1"
                type="textarea"
                rows="3"
                :max-height="300"
              />
            </q-field>
          </q-popup-edit>
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
              @hide="removeAssetClass(c.id)"
            >
              <router-link
                style="color:white;text-decoration:none"
                :to="`/executors/${encodeURIComponent(params.executorId)}/assetclasses/${encodeURIComponent(c.assetClassName)}`"
              >
                {{c.assetClassName}}
              </router-link>
              <q-tooltip v-if="c.assetClassByExecutorIdAndAssetClassName.description">
                {{c.assetClassByExecutorIdAndAssetClassName.description}}
              </q-tooltip>
            </q-chip>

            <asset-class-select-button
              class="col-auto q-ml-md"
              :exclude="myAssetClassNames"
              :executor-id="params.executorId"
              v-on:selection="assetClassSelection"
            />
          </div>

        </q-card-main>
      </q-card>

      <q-table
        :data="myParameters"
        :columns="columns"
        row-key="name"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
      >
        <div slot="top-left" slot-scope="props" class="row items-center">
          <div class="col-auto q-headline">
            Parameters
          </div>

          <div class="q-ml-md row">
            <q-search
              v-if="myParameters.length"
              class="col"
              color="secondary"
              v-model="filter"
              placeholder="Filter"
              clearable
            />
          </div>
        </div>

        <div slot="top-right" slot-scope="props" class="fit">
          <parameter-new-button
            :executor-id="params.executorId"
            :mission-def-id="params.missionDefId"
            v-on:created="parameterCreated"
          />
        </div>

        <q-td slot="body-cell-paramName" slot-scope="props" :props="props"
              style="width:5px;font-family:monospace"
        >
          <router-link
            style="text-decoration:none"
            :to="`/executors/${encodeURIComponent(params.executorId)}/MissionDefs/${encodeURIComponent(params.missionDefId)}/params/${encodeURIComponent(props.value)}`"
          >{{ props.value }}
          </router-link>

        </q-td>

        <q-td slot="body-cell-type" slot-scope="props" :props="props"
              style="width:5px"
        >{{ props.value }}
        </q-td>

        <q-td slot="body-cell-defaultValue" slot-scope="props" :props="props"
              style="width:5px"
        >{{ props.value }}
        </q-td>

        <q-td slot="body-cell-required" slot-scope="props" :props="props"
              style="width:5px"
        >{{ props.value }}
        </q-td>

        <q-td slot="body-cell-description" slot-scope="props" :props="props"
        >
          <pxs-markdown simple hide-empty :text="props.value"/>
        </q-td>

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
  import missionDefUpdate from '../graphql/missionDefUpdate.gql'
  import ParameterNewButton from 'components/parameter-new-button'
  import PxsMarkdown from 'components/pxs-markdown'
  import {Notify} from 'quasar'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      AssetClassSelectButton,
      ParameterNewButton,
      PxsMarkdown,
    },

    data() {
      return {
        loading: false,
        missionDef: null,
        columns: [
          {
            field: 'paramName',
            name: 'paramName',
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
            field: 'defaultValue',
            name: 'defaultValue',
            label: 'Default value',
            align: 'left',
          },
          {
            field: 'required',
            name: 'required',
            label: 'Required'
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

      removeAssetClass(id) {
        if (debug) console.debug('removeAssetClass: id=', id)

        const mutation = missionDefAssetClassDelete
        const variables = {
          id
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
      },

      updateMissionDefId(missionDefId) {
        this.updateMissionDef({missionDefId})
      },

      updateDescription(description) {
        this.updateMissionDef({description})
      },

      updateMissionDef(missionDefPatch) {
        if (debug) console.debug('updateMissionDef missionDefPatch=', missionDefPatch)
        const mutation = missionDefUpdate
        const variables = {
          input: {
            id: this.missionDef.id,
            missionDefPatch
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateMissionDef: mutation data=', data)
            if (missionDefPatch.missionDefId) {
              this.$router.replace(`/executors/${encodeURIComponent(this.params.executorId)}/missiondefs/${encodeURIComponent(missionDefPatch.missionDefId)}`)
              return
            }
            if (missionDefPatch.description) {
              this.missionDef.description = missionDefPatch.description
            }
          })
          .catch((error) => {
            console.error('updateMissionDef: mutation error=', error)
          })
      },
    },

    watch: {
      '$route'() {
        this.refreshMissionDef()
      }
    }
  }
</script>
