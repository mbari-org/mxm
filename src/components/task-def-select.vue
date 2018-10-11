<template>

  <div>
    <q-select
      style="width:17em"
      class="bg-light-blue-1 col-auto"
      v-model="taskDefId"
      :options="options"
      @input="atInput"
      placeholder="Select task definition"
    />
  </div>

</template>

<script>
  const debug = true

  export default {
    props: {
      taskDefs: {
        type: Array,
        required: true
      },
      value: String,
    },

    data() {
      return {
        taskDefId: this.value,
      }
    },

    computed: {
      options () {
        if (debug) console.debug('taskDefs=', this.taskDefs)
        return _.map(this.taskDefs, e => {
          return {
            label: e.taskDefId,
            value: e.taskDefId,
          }
        })
      },
    },

    methods: {
      atInput (val) {
        this.$emit('input', val)
      },
    },

    watch: {
      taskDefs(val) {
        console.log('watch taskDefs=', val)
      }
    },
  }
</script>
