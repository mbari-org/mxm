<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Missions" to="/missions"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshMissions"
      />
    </q-breadcrumbs>

    <q-table
      title="Missions"
      :data="allMissionsList"
      :columns="columns"
      row-key="name"
    >
      <div slot="top-right" slot-scope="props" class="fit">
        <mission-new-button v-on:created="missionCreated"/>
      </div>

      <q-td slot="body-cell-name" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link :to="`/missions/${encodeURIComponent(props.row.missionId)}`">
          {{props.row.name}}
        </router-link>
      </q-td>

    </q-table>
  </q-page>
</template>

<script>
  import MissionNewButton from 'components/mission-new-button'
  import allMissionsList from '../graphql/missions.gql'

  const debug = false

  export default {
    components: {
      MissionNewButton
    },

    data() {
      return {
        allMissionsList: [],
        columns: [
          {
            field: 'name',
            name: 'name',
            label: 'Name',
            align: 'left',
            sortable: true
          },
          {
            field: 'description',
            name: 'description',
            label: 'Description',
            align: 'left',
            sortable: true
          }
        ]
      }
    },

    apollo: {
      allMissionsList,
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
      }
    },

    watch: {
      allMissionsList(val) {
        if (debug) console.log('watch allMissionsList=', val)
      }
    }
  }
</script>
