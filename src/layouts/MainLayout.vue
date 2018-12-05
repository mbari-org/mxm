<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        color="primary"
        :glossy="$q.theme === 'mat'"
        :inverted="$q.theme === 'ios'"
      >
        <img src="statics/new_mbari_logo.png" width="60px" class="q-mr-lg">

        <q-btn flat dense round icon="more_vert"
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        />

        <q-toolbar-title shrink>
          <router-link style="color:white;text-decoration:none" to="/">PXS</router-link>
          <div slot="subtitle">prototype {{pxsAppInfo.version}}</div>
        </q-toolbar-title>

        <div class="row">
          <q-btn
            class="col"
            icon="settings"
            label="Executors"
            no-wrap no-caps
            to="/executors"
          />
        </div>

        <small class="text-weight-thin q-ma-sm">pxsGraphqlUri={{pxsGraphqlUri}}</small>

      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer
      v-model="leftDrawerOpen"
      :content-class="$q.theme === 'mat' ? 'bg-grey-2' : null"
    >
      <q-list
        no-border
        link
        inset-delimiter
      >
        <q-item to="/executors">
          <q-item-side icon="settings"/>
          <q-item-main label="Executors"/>
        </q-item>
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
  export default {
    data() {
      return {
        leftDrawerOpen: false
      }
    },
  }
</script>

<style>
</style>
