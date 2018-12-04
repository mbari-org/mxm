<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Executors" to="/executors"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/executors/${encodeURIComponent(params.executorId)}`"/>
      <q-breadcrumbs-el label="missiondefs"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshMissionDefs"
      />
    </q-breadcrumbs>

    <div v-if="allMissionDefsList">

      <q-table
        :data="allMissionDefsList"
        :columns="missionDefColumns"
        row-key="name"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
      >
        <div slot="top-left" slot-scope="props" class="row items-center">
          <div class="col-auto q-headline">
            Mission definitions
          </div>

          <div class="q-ml-md row">
            <q-search
              v-if="allMissionDefsList.length"
              class="col"
              color="secondary"
              v-model="filter"
              placeholder="Filter"
              clearable
            />
          </div>
        </div>

        <div slot="top-right" slot-scope="props" class="fit">
          <mission-def-new-button
            :executor-id="params.executorId"
            v-on:created="missionDefCreated"
          />
        </div>

        <q-td slot="body-cell-missionDefId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link
            :to="`/executors/${encodeURIComponent(params.executorId)}/missiondefs/${encodeURIComponent(props.row.missionDefId)}`">
            {{props.row.missionDefId}}
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
  import allMissionDefsList from '../graphql/missionDefs.gql'
  import MissionDefNewButton from 'components/mission-def-new-button'
  import PxsMarkdown from 'components/pxs-markdown'
  import {Notify} from 'quasar'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      MissionDefNewButton,
      PxsMarkdown,
    },

    data() {
      return {
        debug,
        loading: false,
        allMissionDefsList: [],

        missionDefColumns: [
          {
            field: 'missionDefId',
            name: 'missionDefId',
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
      allMissionDefsList: {
        query: allMissionDefsList,
        variables() {
          return {
            executorId: this.params.executorId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          return data.allMissionDefsList && data.allMissionDefsList || []
        },
      },
    },

    mounted() {
      this.refreshMissionDefs()
    },

    methods: {
      refreshMissionDefs() {
        this.$apollo.queries.allMissionDefsList.refetch()
      },

      missionDefCreated(data) {
        this.allMissionDefsList.splice(0, 0, data)
      },
    },

    watch: {
      '$route'() {
        this.refreshMissionDefs()
      },

      executor(val) {
        if (debug) console.log('watch executor=', val)
      }
    }
  }
</script>
