<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar
        color="primary" glossy
        class="row justify-between"
      >
        <span class="row">
          <img src="statics/new_mbari_logo.png" width="36px" height="10px" class="q-mr-lg">

          <q-toolbar-title style="font-size:1.2em">
            <router-link style="color:white;text-decoration:none" to="/">
              MXM - Mission Execution Mediation Service
            </router-link>
          </q-toolbar-title>
        </span>

        <div v-if="$mxmConfig" class="columns" >
          <div class="row">
            <div>Preliminary prototype {{ $version.mxm }} -</div>
            <a v-if="$mxmConfig.learnMoreUrl"
               style="color:white;text-decoration:none;margin-left:4px"
               :href="$mxmConfig.learnMoreUrl"
               target="mxm_learnmore"
            >
              Learn more.
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
