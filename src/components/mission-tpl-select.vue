<template>

  <div>
    <q-select
      style="width:17em"
      class="bg-light-blue-1 col-auto"
      v-model="missionTplId"
      :options="options"
      @input="atInput"
      placeholder="Select mission template"
    />
  </div>

</template>

<script>
  const debug = false

  export default {
    props: {
      missionTpls: {
        type: Array,
        required: true
      },
      value: String,
    },

    data() {
      return {
        missionTplId: this.value,
      }
    },

    computed: {
      options() {
        if (debug) console.debug('missionTpls=', this.missionTpls)
        return _.map(this.missionTpls, e => {
          return {
            label: e.missionTplId,
            value: e.missionTplId,
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
      missionTpls(val) {
        if (debug) console.log('watch missionTpls=', val)
      }
    },
  }
</script>
