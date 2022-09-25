<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUtlStore } from 'stores/utl'
import { useQuery } from '@vue/apollo-composable'
import UnitsTable from './UnitsTable.vue'

import { UNITS } from './queries'
import { computed } from 'vue'

const route = useRoute()

const params = computed(() => route.params)
const providerId = computed(() => params.value.providerId)

const {
  result,
  loading,
  refetch: refetchUnits,
} = useQuery(UNITS, {
  providerId,
})

const units = computed(() => result.value?.unitsForProvider ?? [])

useUtlStore().setRefreshFunction(refetchUnits, 'Refresh units')
</script>

<template>
  <q-page class="q-pa-md">
    <div v-if="loading">Loading ...</div>
    <UnitsTable v-else :providerId="providerId" :units="units" />

    <!--
    <pre>params = {{ route.params }}</pre>
    <pre>loading={{ loading }}</pre>
    <pre>UnitsPage: units={{ units }}</pre>
-->
  </q-page>
</template>
