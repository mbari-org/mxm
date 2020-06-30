<template>
  <div id="q-app">
    <router-view/>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {version} from '../package.json'

  Vue.prototype.$version = {
    mxm: version,
  }

  export default {
    name: 'App'
  }
</script>
