<template>
  <div>
    <div v-if="missionTplBasic && missionTplBasic.missionTplId" class="row q-mb-sm">
      <div class="text-bold">{{ missionTplBasic.missionTplId }}</div>
      <div
        v-if="missionTplBasic.retrievedAt"
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

        <div slot="top-right" slot-scope="props" class="fit">
          <mission-tpl-new-button
            :provider-id="params.providerId"
            @created="missionTplCreated"
          />
        </div>

        <q-td slot="body-cell-missionTplId" slot-scope="props" :props="props"
              style="width:5px;vertical-align:top"
        >
          <q-icon
            :name="`far ${props.row.missionTplId.endsWith('/') ? 'fa-folder' : 'fa-file-alt'}`"
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
  import missionTplsDirectoryGql from '../graphql/missionTplsDirectory.gql'

  import MissionTplNewButton from 'components/mission-tpl-new-button'
  import orderBy from "lodash/orderBy"

  const debug = false

  export default {
    components: {
      MissionTplNewButton,
    },

    data() {
      return {
        debug,
        loading: false,
        missionTplBasic: {},
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
        const directory = this.params.missionTplId
        console.assert(!directory || directory.endsWith('/'))
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
            missionTplId: this.params.missionTplId || '',
          }
        },
        update(data) {
          if (debug) console.log('missionTplBasicGql update: data=', data)
          return data.missionTplByProviderIdAndMissionTplId || {}
        },
      },

      allMissionTplsList: {
        query: missionTplsDirectoryGql,
        variables() {
          return {
            providerId: this.params.providerId,
            directory: this.params.missionTplId || '',
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
            ['Home', []],
            [this.params.providerId, [this.params.providerId]],
            ['MissionTemplates', [this.params.providerId, 'mt']],
            [this.directory],
          ],
          refresh: this.refreshMissionTpls
        })
      },

      refreshMissionTpls() {
        // this conditional call needed to avoid 'TypeError: Cannot read property 'refetch' of undefined'
        // apparently upon very first request upon the "immediate" watch below:
        this.$apollo.queries.allMissionTplsList &&
        this.$apollo.queries.allMissionTplsList.refetch()

        this.$apollo.queries.missionTplBasic &&
        this.$apollo.queries.missionTplBasic.refetch()
      },

      missionTplCreated(data) {
        this.allMissionTplsList.splice(0, 0, data)
      },
    },

    watch: {
      '$route.path': {
        handler(val) {
          // console.log('WATCH $route=', val)
          this.setBreadcrumbs()
          this.refreshMissionTpls()
        },
        immediate: true,
      }
    }
  }
</script>
