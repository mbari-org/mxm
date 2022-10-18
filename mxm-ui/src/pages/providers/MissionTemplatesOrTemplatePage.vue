<script setup lang="ts">
import { useRoute } from 'vue-router'

import MissionTemplatePage from './MissionTemplatePage.vue'
import MissionTemplatesPage from './MissionTemplatesPage.vue'
import { computed } from 'vue'

const route = useRoute()

const params = computed(() => route.params)

const doListing = computed(() =>
  (params.value.missionTplId || '/').endsWith('/')
)
</script>

<template>
  <q-page class="q-pa-sm">
    <MissionTemplatesPage v-if="doListing" />
    <MissionTemplatePage v-else />
  </q-page>
</template>
