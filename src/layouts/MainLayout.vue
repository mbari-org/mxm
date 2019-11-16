<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar
        color="primary" glossy
        class="row justify-between"
      >
        <span class="row">
          <img src="statics/new_mbari_logo.png" width="36px" height="10px" class="q-mr-lg">

          <q-toolbar-title shrink>
            <router-link style="color:white;text-decoration:none" to="/">MXM</router-link>
            <div slot="subtitle">
              Prototype {{$utl.appInfo.version}}
              - <a style="color:white" :href="$mxm.learnMoreUrl" target="_blank">Learn more</a>
            </div>
          </q-toolbar-title>
        </span>

        <small class="q-ma-sm">graphql endpoint: {{$mxm.graphqlUri}}</small>

      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>
