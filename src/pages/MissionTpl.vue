<template>
  <q-page class="q-pa-md">
    <div v-if="missionTpl">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-x-sm items-center">
            <div>Mission Template:</div>
            <div class="text-bold" style="font-size:1.1em">
              {{ params.missionTplId }}
              <q-popup-edit
                v-model="missionTpl.missionTplId"
                title="Mission Template ID"
                buttons
                @save="updateMissionTplId"
              >
                <q-input
                  v-model.trim="missionTpl.missionTplId"
                  clearable autofocus
                  class="bg-green-1"
                />
              </q-popup-edit>
            </div>
            <div class="q-ml-xl">
              <q-btn
                class="q-ml-md"
                color="red"
                size="xs"
                dense round icon="delete"
                @click="deleteMissionTpl"
              />
            </div>
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <mxm-markdown
            expandable expandable-title="Description:"
            editable
            :text="missionTpl.description"
            :start-markdown="missionTpl.executorByExecutorId.descriptionFormat === 'markdown'"
            @saveDescription="updateDescription"
          />
        </q-card-section>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-section>
          Associated asset classes:
          <div class="row q-gutter-x-md items-center">
            <q-chip
              class="col-auto shadow-1 q-pr-md"
              v-for="c in myAssetClasses"
              :key="c.assetClassName"
              color="white" text-color="black"
              square
              removable
              @remove="removeAssetClass(c)"
            >
              <router-link
                style="text-decoration:none" class="q-pr-sm"
                :to="$utl.routeLoc([params.executorId, 'ac', c.assetClassName])"
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
              style="min-width:3em; font-size:small"
              :class="`text-primary ${props.row.required ? 'text-bold' : ''}`"
              :to="$utl.routeLoc([params.executorId, 'mt', params.missionTplId, 'p', props.row.paramName])"
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
                :label="`${props.row.paramName} default value:`"
                :param-name="props.row.paramName"
                :param-type="props.row.type"
                :param-value="props.row.defaultValue"
                @save="val => { props.row.defaultValue = val }"
              />
            </div>

            <q-chip
              v-if="props.row.defaultUnits"
              class="rounded-borders q-pa-xs bg-blue-1"
            >
              {{ props.row.defaultUnits }}
            </q-chip>
          </q-td>

          <q-td key="description" :props="props"
                style="vertical-align:top"
          >
            <mxm-markdown
              simple hide-empty :text="props.row.description"
              :start-markdown="missionTpl.executorByExecutorId.descriptionFormat === 'markdown'"
            />
          </q-td>
        </q-tr>
      </q-table>
    </div>

    <div v-else-if="!loading">
      <div class="text-negative">Not found:</div>
      <table class="q-ml-md">
        <tbody>
        <tr><td>Mission Template:<td/><td>{{params.missionTplId}}</td></tr>
        <tr><td>Executor:<td/><td>{{params.executorId}}</td></tr>
        </tbody>
      </table>
    </div>

  </q-page>
</template>

<script>
  import missionTplGql from '../graphql/missionTpl.gql'
  import missionTplAssetClassInsertGql from '../graphql/missionTplAssetClassInsert.gql'
  import missionTplAssetClassDeleteGql from '../graphql/missionTplAssetClassDelete.gql'
  import missionTplUpdateGql from '../graphql/missionTplUpdate.gql'
  import missionTplDeleteGql from '../graphql/missionTplDelete.gql'

  import AssetClassSelectButton from 'components/asset-class-select-button'
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
        query: missionTplGql,
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
          ['MissionTemplates', [this.params.executorId, 'mt']],
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
        const mutation = missionTplAssetClassInsertGql
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
          message: `Remove associated asset class '${c.assetClassName}'?`,
          color: 'negative',
          ok: `Yes, delete association`,
          cancel: true,
          focus: 'cancel',
        }).onOk(() => doIt())

        const doIt = () => {
          if (debug) console.debug('removeAssetClass: id=', c.id)

          const mutation = missionTplAssetClassDeleteGql
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
        const mutation = missionTplUpdateGql
        const variables = {
          input: {
            id: this.missionTpl.id,
            missionTplPatch
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateMissionTpl: mutation data=', data)
            this.$q.notify({
              message: `Mission template updated`,
              timeout: 1000,
              position: 'top',
              color: 'info',
            })
            if (missionTplPatch.missionTplId) {
              this.$utl.replace([this.params.executorId, 'mt', missionTplPatch.missionTplId])
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

      deleteMissionTpl() {
        console.log('deleteMissionTpl: missionTpl=', this.missionTpl)
        this.$q.dialog({
          title: 'Confirm',
          message: `Delete mission template '${this.missionTpl.missionTplId}'?`,
          color: 'negative',
          ok: `Yes, delete '${this.missionTpl.missionTplId}'`,
          cancel: true,
          focus: 'cancel',
        }).onOk(() => {
          const mutation = missionTplDeleteGql
          const variables = {
            input: {
              id: this.missionTpl.id
            }
          }
          this.$apollo.mutate({mutation, variables})
              .then(data => {
                if (debug) console.debug('deleteMissionTpl: mutation data=', data)
                this.$q.notify({
                  message: `Mission template deleted: '${this.missionTpl.missionTplId}'`,
                  timeout: 2000,
                  position: 'top',
                  color: 'info',
                })
                this.$utl.replace([this.params.executorId, 'missionTpls'])
              })
              .catch(error => {
                console.error('deleteMissionTpl: mutation error=', error)
                this.$q.notify({
                  message: `Mission template deletion error: ${JSON.stringify(error)}`,
                  timeout: 0,
                  closeBtn: 'Close',
                  color: 'warning',
                })
              })
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
