<template>

  <div>
    <q-select
      dense
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
  import providerApiTypesGql from '../graphql/providerApiTypes.gql'

  import get from 'lodash/get'
  import map from 'lodash/map'

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
        query: providerApiTypesGql,
        update(data) {
          if (debug) console.log('providerApiTypesGql update: data=', data)
          const enumValues = get(data, '__type.enumValues') || []
          return map(enumValues, o => ({
            label: o.name,
            value: o.name
          }))
        },
      },
    },

    watch: {
      options(val) {
        if (debug) console.log('api-type-select: watch options=', val)
      }
    },
  }
</script>
