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

        <small>
          Prototype {{$utl.appInfo.version}}
          <span v-if="$mxmConfig">
            <span v-if="$mxmConfig.learnMoreUrl">
              -
              <a style="color:white;text-decoration:none"
                 :href="$mxmConfig.learnMoreUrl"
                 target="mxm_learnmore"
              >
                Learn more
              </a>
            </span>
            <div>
              GraphQL endpoint: {{ $mxmConfig.graphqlUri }}
            </div>
          </span>
        </small>
      </q-toolbar>
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
