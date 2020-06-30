<template>
  <div>
    <div v-if="missionTpl">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-x-sm items-center">
            <div>Mission Template:</div>
            <div class="text-bold" style="font-size:1.1em">
              {{ params.missionTplId }}
            </div>
            <div class="q-ml-xl row">
              <div class="q-ml-lg text-grey" style="font-size:smaller">
                {{ missionTpl.retrievedAt }}
                <q-tooltip>Time when this template was last retrieved from the provider</q-tooltip>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <mxm-markdown
            expandable expandable-title="Description:"
            :text="missionTpl.description"
            :start-markdown="missionTpl.providerByProviderId.descriptionFormat === 'markdown'"
          />
        </q-card-section>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-section>
          <div v-if="myAssetClasses.length">
            <div class="row q-gutter-x-md items-center">
              <div>Associated asset class{{myAssetClasses.length > 1 ? 'es' : ''}}:</div>
              <q-chip
                class="col-auto shadow-1"
                v-for="c in myAssetClasses"
                :key="c.assetClassName"
                color="white" text-color="black"
                square dense
              >
                <router-link
                  style="text-decoration:none" class="q-pr-sm"
                  :to="$utl.routeLoc([params.providerId, 'ac', c.assetClassName])"
                >
                  {{c.assetClassName}}
                </router-link>
                <q-tooltip v-if="c.assetClassByProviderIdAndAssetClassName.description">
                  {{c.assetClassByProviderIdAndAssetClassName.description}}
                </q-tooltip>
              </q-chip>
            </div>
          </div>
          <div v-else class="text-grey-7">No associated asset classes</div>
        </q-card-section>
      </q-card>

      <q-table
        :dense="$q.screen.lt.md"
        :data="myParameters"
        :columns="paramColumns"
        row-key="name"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
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

        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td
            key="paramName" :props="props"
            style="width:5px;font-family:monospace;vertical-align:top"
            class="cursor-pointer"
            @dblclick="$router.push($utl.routeLoc([params.providerId, 'mt', params.missionTplId, 'p', props.row.paramName]))"
          >
            <div
              style="font-size:1.1em"
              :class="`text-black ${props.row.required ? 'text-bold' : ''}`"
            >
              {{ props.row.paramName }}
            </div>

            <div
              class="text-grey-7 q-mt-sm" style="font-size:0.8em"
            >
              {{ props.row.type }}
              <span v-if="props.row.valueCanReference">
                | {{ props.row.valueCanReference }}
              </span>
            </div>

          </q-td>

          <q-td key="defaultValue" :props="props"
                style="width:12em;font-family:monospace;vertical-align:top"
          >
            <div
              class="q-pa-xs"
              style="white-space: normal; min-height:1.5em; max-width:12em; overflow-x: auto;"
            >
              <parameter-value
                :label="`${props.row.paramName} default value:`"
                :param-name="props.row.paramName"
                :param-type="props.row.type"
                :param-value="props.row.defaultValue"
                @save="val => { props.row.defaultValue = val }"
              />
            </div>
          </q-td>

          <q-td
            v-if="provider && provider.usesUnits"
            key="defaultUnits" :props="props"
            style="vertical-align:top"
          >
            {{ props.row.defaultUnits }}
          </q-td>

          <q-td key="description" :props="props"
                style="vertical-align:top"
          >
            <mxm-markdown
              simple hide-empty :text="props.row.description"
              :start-markdown="missionTpl.providerByProviderId.descriptionFormat === 'markdown'"
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
        <tr><td>Provider:<td/><td>{{params.providerId}}</td></tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
  import missionTplGql from '../graphql/missionTpl.gql'
  import missionTplUpdateGql from '../graphql/missionTplUpdate.gql'

  import ParameterValue from 'components/parameter-value'
  import map from 'lodash/map'

  const debug = false

  export default {
    components: {
      ParameterValue,
    },

    data() {
      return {
        loading: false,
        missionTpl: null,
        provider: null,

        rowsPerPage: [0],
        pagination: {
          rowsPerPage: 0
        },
        filter: '',
      }
    },

    computed: {
      paramColumns() {
        const cols = [
          {
            field: 'paramName',
            name: 'paramName',
            label: 'Parameter',
            align: 'left',
            sortable: true
          },
          {
            field: 'defaultValue',
            name: 'defaultValue',
            label: 'Default value',
            align: 'left',
          },
        ]
        if (this.provider && this.provider.usesUnits) {
          cols.push({
            field: 'defaultUnits',
            name: 'defaultUnits',
            label: 'Units',
            align: 'left',
          })
        }
        cols.push({
          field: 'description',
          name: 'description',
          label: 'Description',
          align: 'left',
        })

        return cols
      },

      params() {
        return this.$route.params
      },

      myAssetClasses() {
        return this.missionTpl && this.missionTpl.missionTplAssetClassesByProviderIdAndMissionTplIdList || []
      },

      myAssetClassNames() {
        return map(this.myAssetClasses, "assetClassName")
      },

      myParameters() {
        return this.missionTpl && this.missionTpl.parametersByProviderIdAndMissionTplIdList || []
      },
    },

    apollo: {
      missionTpl: {
        query: missionTplGql,
        variables() {
          return {
            providerId: this.params.providerId,
            missionTplId: this.params.missionTplId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          let missionTpl = null
          if (data.missionTplByProviderIdAndMissionTplId) {
            missionTpl = data.missionTplByProviderIdAndMissionTplId
            this.provider = missionTpl.providerByProviderId
          }
          return missionTpl
        },
      },
    },

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [
            [this.params.providerId, [this.params.providerId]],
            ['MissionTemplates', [this.params.providerId, 'mt']],
            [this.params.missionTplId],
          ],
          refresh: this.reloadMissionTpl
        })
      },

      refreshMissionTpl() {
        if (this.$apollo.queries.missionTpl) {
          return this.$apollo.queries.missionTpl.refetch()
        }
      },

      async reloadMissionTpl() {
        // TODO get updated info from the mutation itself
        await this.updateMissionTpl()
        this.refreshMissionTpl()
      },

      async updateMissionTpl() {
        if (debug) console.debug('updateMissionTpl')
        const mutation = missionTplUpdateGql
        const variables = {
          input: {
            id: this.missionTpl.id,
            missionTplPatch: {}  // required but unused
          }
        }
        try {
          const data = await this.$apollo.mutate({mutation, variables})
          if (debug) console.debug('updateMissionTpl: mutation data=', data)
          this.$q.notify({
            message: `Mission template reloaded from provider`,
            timeout: 1000,
            position: 'top',
            color: 'info',
          })
        }
        catch(error) {
          console.error('updateMissionTpl: mutation error=', error)
        }
      },
    },

    watch: {
      params: {
        handler(val) {
          console.warn(`WATCH params=`, val)
          this.setBreadcrumbs()
          this.refreshMissionTpl()
        },
        deep: true,
        immediate: true,
      },
    },
  }
</script>
