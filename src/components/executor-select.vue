<template>

  <q-select
    style="width:17em"
    class="bg-light-blue-1 col-auto"
    v-model="executorId"
    :options="options"
    @input="atInput"
    placeholder="Select executor"
  />

</template>

<script>
  import allExecutorsList from '../graphql/executors.gql'

  const debug = false

  export default {
    props: {
      value: String,
    },

    data() {
      return {
        executorId: this.value,
        allExecutorsList: [],
      }
    },

    computed: {
      options () {
        if (debug) console.debug('allExecutorsList=', this.allExecutorsList)
        return _.map(this.allExecutorsList, e => {
          return {
            label: e.executorId,
            value: e.executorId,
          }
        })
      },
    },

    apollo: {
      allExecutorsList,
    },

    methods: {
      atInput (val) {
        this.$emit('input', val)
      },
    },

    watch: {
      allExecutorsList(val) {
        if (debug) console.log('watch allExecutorsList=', val)
      }
    },
  }
</script>
