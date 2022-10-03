<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUtlStore } from 'stores/utl'
import { useQuery } from '@vue/apollo-composable'
import UnitsTable from './UnitsTable.vue'

import { DERIVED_UNITS } from './queries'
import { computed } from 'vue'

const route = useRoute()

const params = computed(() => route.params)
const unitName = computed(() => params.value.unitName)

const variables = computed(() => ({
  unitName: unitName.value,
}))

const {
  result,
  loading,
  refetch: refetchUnit,
} = useQuery(DERIVED_UNITS, variables)

const unit = computed(() => result.value?.unit ?? {})

useUtlStore().setRefreshFunction(refetchUnit, 'Refresh unit')
</script>

<template>
  <q-page class="q-pa-md">
    <div v-if="unit.unitName">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-x-sm">
            <div class="col-1">Unit:</div>
            <div class="text-bold">{{ unit.unitName }}</div>
          </div>
          <div class="row q-gutter-x-sm">
            <div class="col-1">Abbreviation:</div>
            <div class="text-bold">{{ unit.abbreviation }}</div>
          </div>
          <div class="row q-gutter-x-sm">
            <div class="col-1">Base Unit:</div>
            <div v-if="unit.baseUnit" class="text-bold">
              <router-link
                class="appLink"
                :to="utl.routeLoc(['u', unit.baseUnit])"
              >
                {{ unit.baseUnit }}
              </router-link>
            </div>
          </div>
        </q-card-section>
        <q-separator />
      </q-card>

      <UnitsTable
        v-if="unit.derivedUnits"
        title="Derived Units"
        :units="unit.derivedUnits"
      />
    </div>

    <div v-else-if="!loading">
      Unit not found: <code class="text-bold">{{ params.unitName }}</code>
    </div>

    <!--
    <pre>params = {{ route.params }}</pre>
    <pre>loading={{ loading }}</pre>
    <pre>unit={{ unit }}</pre>
-->
  </q-page>
</template>
