<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Executors" to="/executors"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/executors/${encodeURIComponent(params.executorId)}`"/>
      <q-breadcrumbs-el label="MissionTemplates"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshMissionTpls"
      />
    </q-breadcrumbs>

    <div v-if="allMissionTplsList">

      <q-table
        :data="allMissionTplsList"
        :columns="missionTplColumns"
        row-key="name"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
      >
        <div slot="top-left" slot-scope="props" class="row items-center">
          <div class="col-auto q-headline">
            Mission templates
          </div>

          <div class="q-ml-md row">
            <q-search
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
            :executor-id="params.executorId"
            v-on:created="missionTplCreated"
          />
        </div>

        <q-td slot="body-cell-missionTplId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link
            :to="`/executors/${encodeURIComponent(params.executorId)}/missiontpls/${encodeURIComponent(props.row.missionTplId)}`">
            {{props.row.missionTplId}}
          </router-link>
        </q-td>

        <q-td slot="body-cell-description" slot-scope="props" :props="props"
        >
          <pxs-markdown simple hide-empty :text="props.value"/>
        </q-td>

      </q-table>
    </div>

    <div v-else-if="!loading">
      Executor not found: {{params.executorId}}
    </div>

  </q-page>
</template>

<script>
  import allMissionTplsList from '../graphql/missionTpls.gql'
  import MissionTplNewButton from 'components/mission-tpl-new-button'
  import PxsMarkdown from 'components/pxs-markdown'
  import {Notify} from 'quasar'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      MissionTplNewButton,
      PxsMarkdown,
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
        query: allMissionTplsList,
        variables() {
          return {
            executorId: this.params.executorId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          return data.allMissionTplsList && data.allMissionTplsList || []
        },
      },
    },

    mounted() {
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

      executor(val) {
        if (debug) console.log('watch executor=', val)
      }
    }
  }
</script>
