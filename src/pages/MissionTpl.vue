<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Executors" to="/executors"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/executors/${encodeURIComponent(params.executorId)}`"/>
      <q-breadcrumbs-el label="MissionTemplates" :to="`/executors/${encodeURIComponent(params.executorId)}/missiontpls`"/>
      <q-breadcrumbs-el :label="params.missionTplId"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshMissionTpl"
      />
    </q-breadcrumbs>

    <div v-if="missionTpl">

      <q-card class="q-mb-md">
        <q-card-title>
          Mission Template:
          <span class="text-bold">
            {{ params.missionTplId }}
          <q-popup-edit
            v-model="missionTpl.missionTplId"
            title="Mission Template ID"
            buttons
            @save="updateMissionTplId"
          >
            <q-field>
              <q-input
                v-model.trim="missionTpl.missionTplId"
                clearable
                class="bg-green-1"
              />
            </q-field>
          </q-popup-edit>
          </span>
        </q-card-title>
        <q-card-separator/>
        <q-card-main>
          <pxs-markdown :text="missionTpl.description"/>
          <q-popup-edit
            v-model="missionTpl.description"
            title="Description"
            buttons
            @save="updateDescription"
          >
            <q-field>
              <q-input
                v-model.trim="missionTpl.description"
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
            :mission-tpl-id="params.missionTplId"
            v-on:created="parameterCreated"
          />
        </div>

        <q-td slot="body-cell-paramName" slot-scope="props" :props="props"
              style="width:5px;font-family:monospace"
        >
          <router-link
            style="text-decoration:none"
            :to="`/executors/${encodeURIComponent(params.executorId)}/missiontpls/${encodeURIComponent(params.missionTplId)}/params/${encodeURIComponent(props.value)}`"
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
      Mission Template not found.
      <div class="q-ml-md">
        Executor: {{params.executorId}} <br/>
        Mission Template ID: {{params.missionTplId}}
      </div>
    </div>

  </q-page>
</template>

<script>
  import missionTpl from '../graphql/missionTpl.gql'
  import AssetClassSelectButton from 'components/asset-class-select-button'
  import missionTplAssetClassInsert from '../graphql/missionTplAssetClassInsert.gql'
  import missionTplAssetClassDelete from '../graphql/missionTplAssetClassDelete.gql'
  import missionTplUpdate from '../graphql/missionTplUpdate.gql'
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
        missionTpl: null,
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
        return this.missionTpl && this.missionTpl.missionTplAssetClassesByExecutorIdAndMissionTplIdList || []
      },

      myAssetClassNames() {
        return _.map(this.myAssetClasses, "assetClassName")
      },

      myParameters() {
        return this.missionTpl && this.missionTpl.parametersByExecutorIdAndMissionTplIdList || []
      },
    },

    apollo: {
      missionTpl: {
        query: missionTpl,
        variables() {
          return {
            executorId: this.params.executorId,
            missionTplId: this.params.missionTplId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          if (data.missionTplByExecutorIdAndMissionTplId) {
            return data.missionTplByExecutorIdAndMissionTplId
          }
          else return null
        },
      },
    },

    mounted() {
      this.refreshMissionTpl()
    },

    methods: {
      refreshMissionTpl() {
        this.$apollo.queries.missionTpl.refetch()
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
              this.refreshMissionTpl()
            }
          }
        }

        next()
      },

      addAssetClassName(assetClassName, next) {
        const mutation = missionTplAssetClassInsert
        const variables = {
          executorId: this.params.executorId,
          missionTplId: this.params.missionTplId,
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

        const mutation = missionTplAssetClassDelete
        const variables = {
          id
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (data.data) {
              this.refreshMissionTpl()
            }
          })
          .catch((error) => {
            console.error('mutation error=', error)
          })
      },

      parameterCreated(data) {
        this.refreshMissionTpl()
      },

      updateMissionTplId(missionTplId) {
        this.updateMissionTpl({missionTplId})
      },

      updateDescription(description) {
        this.updateMissionTpl({description})
      },

      updateMissionTpl(missionTplPatch) {
        if (debug) console.debug('updateMissionTpl missionTplPatch=', missionTplPatch)
        const mutation = missionTplUpdate
        const variables = {
          input: {
            id: this.missionTpl.id,
            missionTplPatch
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateMissionTpl: mutation data=', data)
            if (missionTplPatch.missionTplId) {
              this.$router.replace(`/executors/${encodeURIComponent(this.params.executorId)}/missiontpls/${encodeURIComponent(missionTplPatch.missionTplId)}`)
              return
            }
            if (missionTplPatch.description) {
              this.missionTpl.description = missionTplPatch.description
            }
          })
          .catch((error) => {
            console.error('updateMissionTpl: mutation error=', error)
          })
      },
    },

    watch: {
      '$route'() {
        this.refreshMissionTpl()
      }
    }
  }
</script>
