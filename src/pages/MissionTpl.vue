<template>
  <q-page class="q-pa-md">
    <div v-if="missionTpl">
      <q-card class="q-mb-md">
        <q-card-section>
          Mission Template:
          <span class="text-bold">
            {{ params.missionTplId }}
            <q-popup-edit
              v-model="missionTpl.missionTplId"
              title="Mission Template ID"
              buttons
              @save="updateMissionTplId"
            >
              <q-input
                v-model.trim="missionTpl.missionTplId"
                clearable
                class="bg-green-1"
              />
            </q-popup-edit>
          </span>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <mxm-markdown
            expandable expandable-title="Description:"
            editable
            :text="missionTpl.description"
            @saveDescription="updateDescription"
          />
        </q-card-section>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-section>
          Associated asset classes:
          <div class="row q-gutter-md">
            <q-chip
              class="col-auto shadow-1"
              v-for="c in myAssetClasses"
              :key="c.assetClassName"
              color="white" text-color="black"
              square
              removable
              @remove="removeAssetClass(c)"
            >
              <router-link
                style="text-decoration:none"
                :to="$utl.routeLoc([params.executorId, 'assetclasses', c.assetClassName])"
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
              @selection="assetClassSelection"
            />
          </div>

        </q-card-section>
      </q-card>

      <q-table
        :dense="$q.screen.lt.md"
        :data="myParameters"
        :columns="columns"
        row-key="name"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
        separator="cell"
        no-data-label="No parameters defined"
      >
        <div slot="top-left" slot-scope="props" class="row items-center">
          <div class="col-auto text-h5">
            Parameters
          </div>

          <div class="q-ml-md row">
            <q-input
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
            @created="parameterCreated"
          />
        </div>

        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td key="paramName" :props="props"
                style="width:5px;font-family:monospace;vertical-align:top"
          >
            <q-btn
              no-caps dense
              style="min-width:3em"
              :class="`text-primary ${props.row.required ? 'text-bold' : ''}`"
              :to="$utl.routeLoc([params.executorId, 'missiontpls', params.missionTplId, 'params', props.row.paramName])"
            >
              {{ props.row.paramName }}
            </q-btn>
            <div class="text-grey-7 q-mt-sm" style="font-size:0.8em">
              ({{ props.row.type }})
            </div>
          </q-td>

          <q-td key="defaultValue" :props="props"
                style="width:20em;font-family:monospace;vertical-align:top"
          >
            <div
              class="rounded-borders q-pa-xs bg-blue-1"
              style="white-space: normal; min-height:1em"
            >
              <parameter-value
                :param-name="props.row.paramName"
                :param-type="props.row.type"
                :param-value="props.row.defaultValue"
                @save="val => { props.row.defaultValue = val }"
              />
            </div>
          </q-td>

          <q-td key="description" :props="props"
                style="vertical-align:top"
          >
            <mxm-markdown simple hide-empty :text="props.row.description"/>
          </q-td>
        </q-tr>
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
  import ParameterValue from 'components/parameter-value'
  import map from 'lodash/map'
  import difference from 'lodash/difference'

  const debug = false

  export default {
    components: {
      AssetClassSelectButton,
      ParameterNewButton,
      ParameterValue,
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
            field: 'defaultValue',
            name: 'defaultValue',
            label: 'Default value',
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

      myAssetClasses() {
        return this.missionTpl && this.missionTpl.missionTplAssetClassesByExecutorIdAndMissionTplIdList || []
      },

      myAssetClassNames() {
        return map(this.myAssetClasses, "assetClassName")
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
      this.$store.commit('utl/setBreadcrumbs', {
        elements: [
          ['Home', []],
          [this.params.executorId, [this.params.executorId]],
          ['MissionTemplates', [this.params.executorId, 'missiontpls']],
          [this.params.missionTplId],
        ],
        refresh: this.refreshMissionTpl
      })

      this.refreshMissionTpl()
    },

    methods: {
      refreshMissionTpl() {
        this.$apollo.queries.missionTpl.refetch()
      },

      assetClassSelection(data) {
        const newAssetClassNames = difference(data, this.myAssetClassNames)
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
              this.$q.notify({
                message: `Asset associated (${added.length})`,
                timeout: 1000,
                color: 'info'
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

      removeAssetClass(c) {
        this.$q.dialog({
          title: 'Confirm',
          message: `Remove asset class '${c.assetClassName}'?`,
          color: 'negative',
          ok: true,
          cancel: true
        }).onOk(() => doIt())

        const doIt = () => {
          if (debug) console.debug('removeAssetClass: id=', c.id)

          const mutation = missionTplAssetClassDelete
          const variables = {
            id: c.id
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
        }
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
              this.$utl.replace([this.params.executorId, 'missiontpls', missionTplPatch.missionTplId])
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
