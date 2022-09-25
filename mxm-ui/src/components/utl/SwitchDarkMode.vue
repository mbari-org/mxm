<script setup lang="ts">
import { useQuasar } from 'quasar'

import { useOptsStore } from 'stores/opts'

interface Props {
  size?: string
  suffix?: string
}

withDefaults(defineProps<Props>(), {
  size: '18px',
})

const $q = useQuasar()

function switchDarkMode() {
  $q.dark.set(!$q.dark.isActive)
  const darkMode = $q.dark.isActive ? 'on' : 'off'
  useOptsStore().setDarkMode(darkMode)
}
</script>

<template>
  <q-icon
    @click="switchDarkMode()"
    :name="$q.dark.isActive ? 'wb_sunny' : 'nights_stay'"
    :size="size"
    class="cursor-pointer"
  >
    <q-tooltip>Switch light and dark modes</q-tooltip>
  </q-icon>
</template>
