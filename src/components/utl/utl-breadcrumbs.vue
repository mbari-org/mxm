<template>
  <div
    v-if="_elements"
    class="q-pl-md q-pb-xs bg-white shadow-1 text-grey"
  >
    <q-breadcrumbs
      active-color="secondary" color="light"
    >
      <template v-slot:separator>
        <q-icon
          size="1.5em"
          name="chevron_right"
        />
      </template>

      <q-breadcrumbs-el
        icon="home"
        to="/"
      />

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
