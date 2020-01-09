<template>
  <q-page class="q-pa-md">
    <div v-if="allMissionTplsList">
      <q-table
        :data="allMissionTplsList"
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

  </q-page>
</template>

<script>
  import allMissionTplsListGql from '../graphql/missionTpls.gql'

  import MissionTplNewButton from 'components/mission-tpl-new-button'

  const debug = false

  export default {
    components: {
      MissionTplNewButton,
    },

    data() {
      return {
        debug,
        loading: false,
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
    },

    apollo: {
      allMissionTplsList: {
        query: allMissionTplsListGql,
        variables() {
          return {
            providerId: this.params.providerId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          return data.allMissionTplsList && data.allMissionTplsList || []
        },
      },
    },

    mounted() {
      this.$store.commit('utl/setBreadcrumbs', {
        elements: [
          ['Home', []],
          [this.params.providerId, [this.params.providerId]],
          ['MissionTemplates', [this.params.providerId, 'mt']],
        ],
        refresh: this.refreshMissionTpls
      })

      this.refreshMissionTpls()
    },

    methods: {
      refreshMissionTpls() {
        this.$apollo.queries.allMissionTplsList.refetch()
      },

      missionTplCreated(data) {
        this.allMissionTplsList.splice(0, 0, data)
      },
    },

    watch: {
      '$route'() {
        this.refreshMissionTpls()
      },

      provider(val) {
        if (debug) console.log('watch provider=', val)
      }
    }
  }
</script>
