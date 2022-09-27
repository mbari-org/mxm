<script setup lang="ts">
import { useOptsStore } from 'stores/opts'
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

onMounted(() => {
  const darkMode = useOptsStore().darkMode
  // console.debug('reflectDarkMode', darkMode)
  $q.dark.set(darkMode === 'auto' ? 'auto' : darkMode === 'on')
})
</script>

<template>
  <router-view />
</template>

<style>
body.body--dark .appLink {
  text-decoration: none;
  color: aquamarine;
}

.appLink {
  text-decoration: none;
  font-size: 13px !important;
}

body.body--dark .fieldBg {
  background-color: #3d3d37 !important;
}

.fieldBg {
  /* as in quasar bg-blue-1 */
  background-color: rgb(227, 242, 253) !important;
}

body.body--dark .markdownBg {
  background-color: rgba(41, 41, 37, 0.76) !important;
  border-color: #4f4f4f;
}

body.body--dark .myMarkdown a {
  /* better display of links */
  color: aquamarine;
}

.markdownBg {
  background-color: rgb(233, 244, 251) !important;
  border-color: #acacac;
  border-style: solid;
  border-width: 1px;
}
</style>
