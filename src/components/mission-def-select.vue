<template>

  <div>
    <q-select
      style="width:17em"
      class="bg-light-blue-1 col-auto"
      v-model="missionDefId"
      :options="options"
      @input="atInput"
      placeholder="Select mission definition"
    />
  </div>

</template>

<script>
  const debug = false

  export default {
    props: {
      missionDefs: {
        type: Array,
        required: true
      },
      value: String,
    },

    data() {
      return {
        missionDefId: this.value,
      }
    },

    computed: {
      options() {
        if (debug) console.debug('missionDefs=', this.missionDefs)
        return _.map(this.missionDefs, e => {
          return {
            label: e.missionDefId,
            value: e.missionDefId,
          }
        })
      },
    },

    methods: {
      atInput(val) {
        this.$emit('input', val)
      },
    },

    watch: {
      missionDefs(val) {
        if (debug) console.log('watch missionDefs=', val)
      }
    },
  }
</script>
