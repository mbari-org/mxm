<template>
  <q-page class="q-pa-md">
    <units-table
      :provider-id="params.providerId"
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
        return this.$store.state.units.unitsByProvider[this.params.providerId] || []
      },
    },

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [
            [this.params.providerId, [this.params.providerId]],
            ['Units'],
          ],
          refresh: this.refreshUnits
        })
      },

      refreshUnits() {
        this.$store.dispatch('units/getOrLoadUnitsForProvider', this.params.providerId)
      },
    },

    watch: {
      params: {
        handler(val) {
          console.warn('WATCH params=', val)
          this.setBreadcrumbs()
          this.refreshUnits()
        },
        deep: true,
        immediate: true,
      },
    },
  }
</script>
