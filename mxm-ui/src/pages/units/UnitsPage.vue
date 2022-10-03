<script setup lang="ts">
import { useUtlStore } from 'stores/utl'
import { useQuery } from '@vue/apollo-composable'
import UnitsTable from './UnitsTable.vue'

import { UNITS } from './queries'
import { computed } from 'vue'

const { result, loading, refetch: refetchUnits } = useQuery(UNITS)

const units = computed(() => result.value?.allUnits ?? [])

useUtlStore().setRefreshFunction(refetchUnits, 'Refresh units')
</script>

<template>
  <q-page class="q-pa-md">
    <div v-if="loading">Loading ...</div>
    <UnitsTable v-else :units="units" />

    <!--
    <pre>params = {{ route.params }}</pre>
    <pre>loading={{ loading }}</pre>
    <pre>UnitsPage: units={{ units }}</pre>
-->
  </q-page>
</template>
