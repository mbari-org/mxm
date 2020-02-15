<template>
  <q-page class="q-pa-md">
    <div v-if="unit">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-x-sm">
            <div class="col-1">Unit:</div>
            <div class="text-bold">{{unit.unitName}}</div>
          </div>
          <div class="row q-gutter-x-sm">
            <div class="col-1">Abbreviation:</div>
            <div class="text-bold">{{unit.abbreviation}}</div>
          </div>
          <div class="row q-gutter-x-sm">
            <div class="col-1">Base Unit:</div>
            <div v-if="unit.baseUnit" class="text-bold">
              <router-link
                style="text-decoration:none"
                :to="$utl.routeLoc([params.providerId, 'u', unit.baseUnit])"
              >
                {{unit.baseUnit}}
              </router-link>

            </div>
          </div>
        </q-card-section>
        <q-separator/>
      </q-card>

      <units-table
        :provider-id="params.providerId"
        title="Derived Units"
        :units="derivedUnits"
      />
    </div>

    <div v-else-if="!loading">
      Unit not found: {{params.unitName}}
    </div>
  </q-page>
</template>

<script>
  import unitGql from '../graphql/unit.gql'

  import UnitsTable from 'components/units-table.vue'

  const debug = false

  export default {
    components: {
      UnitsTable,
    },

    data() {
      return {
        loading: false,
        unit: null,
      }
    },

    computed: {
      params() {
        return this.$route.params
      },

      derivedUnits() {
        const list = this.unit && this.unit.unitsByProviderIdAndBaseUnitList || []
        return list
      },
    },

    apollo: {
      unit: {
        query: unitGql,
        variables() {
          return {
            providerId: this.params.providerId,
            unitName: this.params.unitName
          }
        },
        update(data) {
          let res = null
          if (debug) console.debug('update: data=', data)
          if (data.unitByProviderIdAndUnitName) {
            res = data.unitByProviderIdAndUnitName
          }
          return res
        },
      },
    },

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [
            [this.params.providerId, [this.params.providerId]],
            ['Units', [this.params.providerId, 'u']],
            [this.params.unitName],
          ],
          refresh: this.refreshUnit
        })
      },

      refreshUnit() {
        if (this.$apollo.queries.unit) {
          this.$apollo.queries.unit.refetch()
        }
      },
    },

    watch: {
      params: {
        handler(val) {
          console.warn('WATCH params=', val)
          this.setBreadcrumbs()
          this.refreshUnit()
        },
        deep: true,
        immediate: true,
      },
    },
  }
</script>
