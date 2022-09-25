<script setup lang="ts">
import { useUtlStore } from 'stores/utl'
import { computed, inject, watch } from 'vue'
import { useRoute } from 'vue-router'

const debug = window.location.search.match(/.*debug=.*\bbread\b.*/)

const route = useRoute()

const params = computed(() => route.params)

interface Element {
  label: string
  parts?: string[]
}

const utlStore = useUtlStore()
const breadcrumbs = computed(() => utlStore.breadcrumbs || {})

// const elements = computed(() => breadcrumbs.value.elements || [])
const elements: Element[] = computed(() => {
  // console.debug('params=', params.value)
  const providerId = params.value.providerId
  switch (route.name) {
    case 'ProvidersPage': {
      return []
    }
    case 'ProviderPage': {
      return [{ label: params.value.providerId }]
    }
    case 'MissionTemplatesPageRoot':
    case 'MissionTemplatesPageWithId': {
      const missionTplId = params.value.missionTplId || '/'
      return [
        { label: providerId, parts: [providerId] },
        { label: 'MissionTemplates', parts: [providerId, 'mt'] },
        { label: missionTplId },
      ]
    }
    case 'ParameterPage': {
      const missionTplId = params.value.missionTplId || '/'
      return [
        { label: providerId, parts: [providerId] },
        { label: 'MissionTemplates', parts: [providerId, 'mt'] },
        { label: missionTplId, parts: [providerId, 'mt', missionTplId] },
        { label: 'Params', parts: [providerId, 'mt', missionTplId] },
        { label: params.value.paramName },
      ]
    }
    case 'MissionsPage': {
      return [{ label: providerId, parts: [providerId] }, { label: 'Missions' }]
    }
    case 'MissionPage': {
      return [
        { label: providerId, parts: [providerId] },
        { label: 'Missions', parts: [providerId, 'm'] },
        { label: params.value.missionId },
      ]
    }
    case 'AssetClassesPage': {
      return [
        { label: providerId, parts: [providerId] },
        { label: 'AssetClasses' },
      ]
    }
    case 'AssetClassPage': {
      return [
        { label: providerId, parts: [providerId] },
        { label: 'AssetClasses', parts: [providerId, 'ac'] },
        { label: params.value.className },
      ]
    }
    case 'AssetsPage': {
      return [{ label: providerId, parts: [providerId] }, { label: 'Assets' }]
    }
    case 'AssetPage': {
      return [
        { label: providerId, parts: [providerId] },
        { label: 'Assets', parts: [providerId, 'a'] },
        { label: params.value.assetId },
      ]
    }
    case 'UnitsPage': {
      return [{ label: providerId, parts: [providerId] }, { label: 'Units' }]
    }
    case 'UnitPage': {
      return [
        { label: providerId, parts: [providerId] },
        { label: 'Units', parts: [providerId, 'u'] },
        { label: params.value.unitName },
      ]
    }
  }
  return []
})

watch(breadcrumbs, newValue => {
  console.debug('BC: watch: breadcrumbs:', newValue)
})

const utl = inject('utl')

function _getTo(a) {
  return a && utl.routeLoc(a)
}
</script>

<template>
  <div>
    <pre v-if="debug">{{ breadcrumbs }}</pre>
    <div
      class="row q-pl-sm q-py-xs fieldBg shadow-1 text-blue-8 items-center q-gutter-x-md"
    >
      <q-breadcrumbs active-color="secondary">
        <template v-slot:separator>
          <q-icon size="1.5em" name="chevron_right" color="secondary" />
        </template>

        <q-breadcrumbs-el icon="home" to="/" />

        <q-breadcrumbs-el
          v-for="(e, index) in elements"
          :key="index"
          :label="e.label"
          :to="e.parts && _getTo(e.parts)"
          class="text-cyan"
        />
      </q-breadcrumbs>

      <q-btn
        :disable="!breadcrumbs.refresh"
        dense
        round
        icon="refresh"
        size="xs"
        @click="breadcrumbs.refresh"
        color="secondary"
      >
        <q-tooltip
          >{{ breadcrumbs.tooltip || `Refresh ${route.name}` }}
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>
