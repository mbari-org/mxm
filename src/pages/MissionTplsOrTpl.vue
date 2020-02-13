<template>
  <q-page class="q-pa-md">
    <mission-tpls v-if="doListing" />
    <mission-tpl v-else />
  </q-page>
</template>

<script>
  export default {
    components: {
      MissionTpls: () => import('pages/MissionTpls'),
      MissionTpl:  () => import('pages/MissionTpl'),
    },

    computed: {
      doListing() {
        const missionTplId = this.$route.params.missionTplId || '/'
        return missionTplId.endsWith('/')
      },
    },
  }
</script>
