<template>

  <div>
    <q-select
      style="width:24em"
      class="bg-light-blue-1"
      :options="options"
      placeholder="Select"
      :value="value"
      @change="val => { $emit('change', val) }"
      @input="val => { $emit('input', val) }"
    />
  </div>

</template>

<script>
  import executorApiTypes from '../graphql/executorApiTypes.gql'
  import _ from 'lodash'

  const debug = false

  export default {
    props: {
      value: String,
    },

    data() {
      return {
        options: [],
      }
    },

    apollo: {
      options: {
        query: executorApiTypes,
        update(data) {
          if (debug) console.log('executorApiTypes update: data=', data)
          const enumValues = _.get(data, '__type.enumValues') || []
          return _.map(enumValues, o => ({
            label: o.name,
            value: o.name
          }))
        },
      },
    },

    methods: {
      atInput(val) {
        if (debug) console.debug('atInput: val=', val)
        this.$emit('input', val)
      },
    },

    watch: {
      options(val) {
        if (debug) console.log('api-type-select: watch options=', val)
      }
    },
  }
</script>
