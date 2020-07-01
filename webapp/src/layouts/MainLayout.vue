<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar
        color="primary"
        class="glossy row justify-between q-pb-sm"
      >
        <div class="row">
          <img src="statics/new_mbari_logo.png" width="36px" height="10px" class="q-mr-lg">

          <q-toolbar-title style="font-size:1.1em">
            <router-link style="color:white;text-decoration:none" to="/">
              MXM - Mission Execution Mediation Service
            </router-link>
          </q-toolbar-title>
        </div>

        <div v-if="$mxmConfig" class="column">
          <div class="row justify-between">
            <div class="row q-gutter-x-md">
              <div>Prototype {{ $version.mxm }}</div>
              <a v-if="$mxmConfig.learnMoreUrl"
                 class="text-white"
                 :href="$mxmConfig.learnMoreUrl"
                 target="mxm_learnmore" rel="noopener"
              >
                Learn more
              </a>
            </div>
            <a href="https://github.com/mbari-org/mxm"
               target="_blank" rel="noopener"
               style="text-decoration:none"
               class="text-white"
            >
              <q-icon name="fab fa-github" />
            </a>
          </div>
          <small>
            GraphQL endpoint: {{ $mxmConfig.graphqlUri }}
          </small>
        </div>
      </q-toolbar>

      <utl-breadcrumbs />

    </q-header>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
  export default {
    name: 'MainLayout',
  }
</script>
