<template>
  <div>
    <pre v-if="false">missionTplBasic={{missionTplBasic}}</pre>

    <div class="row q-mb-sm items-center">
      <q-icon
        name="far fa-folder"
        size="16px"
        class="q-mr-xs"
      />
      <div style="font-size:large">{{ directory }}</div>
      <div
        v-if="missionTplBasic && missionTplBasic.retrievedAt"
        class="q-ml-lg text-grey" style="font-size:smaller"
      >
        {{ missionTplBasic.retrievedAt }}
        <q-tooltip>Time when this template listing was last retrieved from the provider</q-tooltip>
      </div>
    </div>

    <div v-if="allMissionTplsList">
      <q-table
        :data="sortedAllMissionTplsList"
        :columns="missionTplColumns"
        row-key="name"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
        separator="cell"
        no-data-label="No mission templates defined"
      >
        <div slot="top-left" slot-scope="props" class="row items-center">
          <div class="col-auto text-h5">
            Mission templates
          </div>

          <div class="q-ml-md row">
            <q-input
              v-if="allMissionTplsList.length"
              class="col"
              color="secondary"
              v-model="filter"
              placeholder="Filter"
              clearable
            />
          </div>
        </div>

        <q-td slot="body-cell-missionTplId" slot-scope="props" :props="props"
              style="width:5px;vertical-align:top"
        >
          <q-icon
            v-if="props.row.missionTplId.endsWith('/')"
            name="far fa-folder"
            size="12px"
            class="q-mr-xs"
          />
          <router-link
            style="text-decoration:none"
            :to="$utl.routeLoc([params.providerId, 'mt', props.row.missionTplId])"
          >
            {{props.row.missionTplId}}
          </router-link>
        </q-td>

        <q-td slot="body-cell-description" slot-scope="props" :props="props"
              style="vertical-align:top"
        >
          <mxm-markdown
            expandable :expandable-subtitle-limit="80"
            simple hide-empty
            :text="props.value"
            :start-markdown="props.row.providerByProviderId.descriptionFormat === 'markdown'"
          />
        </q-td>

      </q-table>
    </div>

    <div v-else-if="!loading">
      Provider not found: {{params.providerId}}
    </div>

  </div>
</template>

<script>
  import missionTplBasicGql from '../graphql/missionTplBasic.gql'
  import missionTplUpdateGql from '../graphql/missionTplUpdate.gql'
  import missionTplsDirectoryGql from '../graphql/missionTplsDirectory.gql'

  import orderBy from "lodash/orderBy"

  const debug = false

  export default {
    data() {
      return {
        debug,
        loading: false,
        missionTplBasic: null,
        allMissionTplsList: [],

        missionTplColumns: [
          {
            field: 'missionTplId',
            name: 'missionTplId',
            label: 'ID',
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

      directory() {
        const directory = this.params.missionTplId || '/'
        console.assert(directory.endsWith('/'))
        return directory
      },

      sortedAllMissionTplsList() {
        return orderBy(this.allMissionTplsList, mt => mt.missionTplId.endsWith('/') ? 1 : 0)
      },
    },

    apollo: {
      missionTplBasic: {
        query: missionTplBasicGql,
        variables() {
          return {
            providerId: this.params.providerId,
            missionTplId: this.directory,
          }
        },
        update(data) {
          if (debug) console.log('missionTplBasicGql update: data=', data)
          return data.missionTplByProviderIdAndMissionTplId || {}
        },
      },

      allMissionTplsList: {
        skip () {
          if (!this.missionTplBasic) {
            return true
          }
          else if (this.missionTplBasic.retrievedAt) {
            return false
          }
          else {
            // trigger reload so retrievedAt is first set
            this.reloadMissionTpls()
            return true
          }
        },
        query: missionTplsDirectoryGql,
        variables() {
          return {
            providerId: this.params.providerId,
            directory: this.directory,
          }
        },
        update(data) {
          /*if (debug)*/ console.log('update: data=', data)
          return data.listMissionTplsDirectoryList && data.listMissionTplsDirectoryList || []
        },
      },
    },

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [
            [this.params.providerId, [this.params.providerId]],
            ['MissionTemplates', [this.params.providerId, 'mt']],
            [this.directory],
          ],
          refresh: this.reloadMissionTpls
        })
      },

      async refreshMissionTpls() {
        // conditional refetch calls needed to avoid 'TypeError: Cannot read property 'refetch' of undefined'
        // apparently upon very first request from the "immediate" watch below.
        // See https://github.com/vuejs/vue-apollo/issues/880

        if (this.$apollo.queries.missionTplBasic) {
          await this.$apollo.queries.missionTplBasic.refetch()

          if (this.$apollo.queries.allMissionTplsList) {
            // console.debug('refreshMissionTpls: directory=', this.directory)
            this.$apollo.queries.allMissionTplsList.refetch()
          }
        }
      },

      async reloadMissionTpls() {
        this.$q.loading.show({
          message: `Reloading template directory ${this.directory} ...`
        })
        try {
          // TODO get updated info from the mutation itself
          await this.updateMissionTplBasic()
          await this.refreshMissionTpls()
        }
        finally {
          this.$q.loading.hide()
        }
      },

      async updateMissionTplBasic() {
        const id = this.missionTplBasic && this.missionTplBasic.id
        if (!id) {
          // TODO handing this root directory case.
          return
        }

        if (debug) console.debug('updateMissionTplBasic')
        const mutation = missionTplUpdateGql
        const variables = {
          input: {
            id: this.missionTplBasic.id,
            missionTplPatch: {}  // required but unused
          }
        }
        try {
          const data = await this.$apollo.mutate({mutation, variables})
          if (debug) console.debug('updateMissionTpl: mutation data=', data)
          this.$q.notify({
            message: `Mission template directory updated`,
            timeout: 1000,
            position: 'top',
            color: 'info',
          })
        }
        catch(error) {
          console.error('updateMissionTplBasic: mutation error=', error)
        }
      },
    },

    watch: {
      params: {
        handler(val) {
          console.warn(`WATCH params=`, val)
          this.setBreadcrumbs()
          this.refreshMissionTpls()
        },
        deep: true,
        immediate: true,
      },
    },
  }
</script>
