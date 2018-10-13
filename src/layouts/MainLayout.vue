<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        color="primary"
        :glossy="$q.theme === 'mat'"
        :inverted="$q.theme === 'ios'"
      >
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu"/>
        </q-btn>

        <q-toolbar-title shrink>
          <router-link style="color:white;text-decoration:none" to="/">PXS UI</router-link>
          <div slot="subtitle">prototype v0.0.0</div>
        </q-toolbar-title>

        <div class="row">
          <q-btn
            class="col"
            icon="settings"
            label="Executors"
            no-wrap no-caps
            to="/executors"
          />
          <q-btn
            class="col"
            icon="ballot"
            label="Missions"
            no-wrap no-caps
            to="/missions"
          />
          <q-btn
            class="col"
            icon="ballot"
            label="Asset Classes"
            no-wrap no-caps
            to="/assetclasses"
          />
        </div>

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
        <q-item to="/missions">
          <q-item-side icon="ballot"/>
          <q-item-main label="Missions"/>
        </q-item>
        <q-item to="/assetclasses">
          <q-item-side icon="ballot"/>
          <q-item-main label="Asset Classes"/>
        </q-item>
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
  import {openURL} from 'quasar'

  export default {
    data() {
      return {
        leftDrawerOpen: false
      }
    },
    methods: {
      openURL
    }
  }
</script>

<style>
</style>
