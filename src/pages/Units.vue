<template>
  <q-page class="q-pa-md">
    <units-table
      :executor-id="params.executorId"
      :units="allUnitsList"
    />
  </q-page>
</template>

<script>
  import allUnitsListGql from '../graphql/units.gql'

  import UnitsTable from 'components/units-table.vue'

  const debug = false

  export default {
    components: {
      UnitsTable,
    },

    data() {
      return {
        allUnitsList: [],
      }
    },

    computed: {
      params() {
        return this.$route.params
      },
    },

    apollo: {
      allUnitsList: {
        query: allUnitsListGql,
        variables() {
          return {
            executorId: this.params.executorId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          return data.allUnitsList || []
        },
      },
    },

    mounted() {
      this.$store.commit('utl/setBreadcrumbs', {
        elements: [
          ['Home', []],
          [this.params.executorId, [this.params.executorId]],
          ['Units'],
        ],
        refresh: this.refreshUnits
      })

      this.refreshUnits()
    },

    methods: {
      refreshUnits() {
        this.$apollo.queries.allUnitsList.refetch()
      },
    },
  }
</script>
