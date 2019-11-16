<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/${euc(params.executorId)}`"/>
      <q-breadcrumbs-el label="Missions"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshMissions"
      />
    </q-breadcrumbs>

    <q-table
      :data="allMissionsList"
      :columns="columns"
      row-key="name"
      :rows-per-page-options="rowsPerPage"
      :pagination.sync="pagination"
      :filter="filter"
    >
      <div slot="top-left" slot-scope="props" class="row items-center">
        <div class="col-auto text-h5">
          Missions
        </div>

        <div class="q-ml-md row">
          <q-input
            v-if="allMissionsList.length"
            class="col"
            color="secondary"
            v-model="filter"
            placeholder="Filter"
            clearable
          />
        </div>
      </div>

      <div slot="top-right" slot-scope="props" class="fit">
        <mission-new-button
          :executor-id="params.executorId"
          v-on:created="missionCreated"
        />
      </div>

      <q-td slot="body-cell-missionId" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link :to="`/${euc(params.executorId)}/missiontpls/${euc(props.row.missionTplId)}/missions/${euc(props.row.missionId)}`">
          {{props.value}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-missionTplId" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link :to="`/${euc(params.executorId)}/missiontpls/${euc(props.value)}`">
          {{props.value}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-assetId" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link :to="`/${euc(params.executorId)}/assets/${euc(props.value)}`">
          {{props.value}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-description" slot-scope="props" :props="props"
      >
        <mxm-markdown simple hide-empty :text="props.value"/>
      </q-td>

      <q-td slot="body-cell-missionStatus" slot-scope="props" :props="props"
            style="width:5px"
      >
        <q-chip dense>{{props.value}}</q-chip>
      </q-td>

    </q-table>
  </q-page>
</template>

<script>
  import allMissionsList from '../graphql/missions.gql'
  import MissionNewButton from 'components/mission-new-button'
  import MxmMarkdown from 'components/mxm-markdown'

  const debug = false

  export default {
    components: {
      MissionNewButton,
      MxmMarkdown,
    },

    data() {
      return {
        allMissionsList: [],
        columns: [
          {
            field: 'missionId',
            name: 'missionId',
            label: 'Mission ID',
            align: 'left',
            sortable: true
          },
          {
            field: 'missionTplId',
            name: 'missionTplId',
            label: 'Template',
            align: 'left',
            sortable: true
          },
          {
            field: 'assetId',
            name: 'assetId',
            label: 'Asset',
            align: 'left',
            sortable: true
          },
          {
            field: 'description',
            name: 'description',
            label: 'Mission Description',
            align: 'left',
            sortable: true
          },
          {
            field: 'missionStatus',
            name: 'missionStatus',
            label: 'Status',
            align: 'right',
            sortable: true
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
    },

    apollo: {
      allMissionsList: {
        query: allMissionsList,
        variables() {
          return {
            executorId: this.params.executorId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          return data.allMissionsList && data.allMissionsList || []
        },
      },
    },

    mounted() {
      this.refreshMissions()
    },

    methods: {
      refreshMissions() {
        this.$apollo.queries.allMissionsList.refetch()
      },

      missionCreated(data) {
        this.refreshMissions()
      },

      euc(c) {
        return encodeURIComponent(c)
      },
    },

    watch: {
      allMissionsList(val) {
        if (debug) console.log('watch allMissionsList=', val)
      }
    }
  }
</script>
