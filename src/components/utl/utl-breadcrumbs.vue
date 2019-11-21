<template>
  <div
    v-if="_elements"
    class="q-pl-md q-pb-xs bg-white shadow-1 text-grey"
  >
    <q-breadcrumbs
      active-color="secondary" color="light"
    >
      <q-breadcrumbs-el
        v-for="(e, index) in _elements" :key="index"
        :label="e[0]"
        :to="_getTo(e[1])"
      />
      <q-btn
        v-if="!!_refresh"
        dense round icon="refresh" class="q-ml-lg" size="xs"
        @click="_refresh"
      />
    </q-breadcrumbs>
  </div>
</template>

<script>
  import map from 'lodash/map'

  export default {
    name: 'utl-breadcrumbs',

    computed: {
      breadcrumbs() {
        return this.$store.state.utl.breadcrumbs
      },

      _elements() {
        return this.breadcrumbs.elements
      },

      _refresh() {
        return this.breadcrumbs.refresh
      },
    },

    methods: {
      _getTo(a) {
        return a && this.$utl.routeLoc(a)
      },
    },

    watch:{
      $route() {
        this.$store.commit('utl/setBreadcrumbs', null)
      },
    },
  }
</script>
