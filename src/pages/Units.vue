<template>
  <q-page class="q-pa-md">
    <units-table
      :executor-id="params.executorId"
      :units="units"
    />
  </q-page>
</template>

<script>
  import UnitsTable from 'components/units-table.vue'

  const debug = window.location.search.match(/.*debug=.*units.*/)

  export default {
    components: {
      UnitsTable,
    },

    computed: {
      params() {
        return this.$route.params
      },

      units() {
        return this.$store.state.units.unitsByExecutor[this.params.executorId] || []
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
        this.$store.dispatch('units/getOrLoadUnitsForExecutor', this.params.executorId)
      },
    },
  }
</script>
