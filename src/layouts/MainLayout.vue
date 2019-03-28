<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        color="primary"
        :glossy="$q.theme === 'mat'"
        :inverted="$q.theme === 'ios'"
      >
        <img src="statics/new_mbari_logo.png" width="60px" class="q-mr-lg">

        <q-toolbar-title shrink>
          <router-link style="color:white;text-decoration:none" to="/">MXMS</router-link>
          <div slot="subtitle">prototype {{$utl.appInfo.version}}</div>
        </q-toolbar-title>

        <small class="q-ma-sm">mxmsGraphqlUri: {{mxmsGraphqlUri}}</small>

      </q-toolbar>
    </q-layout-header>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>
