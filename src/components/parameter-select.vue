<template>

  <div>
    <q-select
      style="width:17em"
      class="bg-light-blue-1 col-auto"
      v-model="paramName"
      :options="options"
      @input="atInput"
      placeholder="Select parameter"
    />
  </div>

</template>

<script>
  import map from 'lodash/map'

  const debug = false

  export default {
    props: {
      parameters: {
        type: Array,
        required: true
      },
      value: String,
    },

    data() {
      return {
        paramName: this.value,
      }
    },

    computed: {
      options() {
        return map(this.parameters, p => {
          return {
            label: p.paramName,
            value: p.paramName,
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
      parameters(val) {
        if (debug) console.log('watch parameters=', val)
      }
    },
  }
</script>
