<template>
  <q-select
    :style="`width:${width}`"
    class="bg-light-blue-1" filled dense
    :options="typeOptions"
    hide-bottom-space
    :error="!value"
    :value="value"
    emit-value
    @input="val => { $emit('input', val) }"
  />
</template>

<script>
  import map from 'lodash/map'

  const types = [
    'float', 'integer', 'boolean', 'string',
    'Point', 'MultiPoint', 'LineString', 'Polygon',
  ]

  const typeOptions = map(types, t => ({
    label: t,
    value: t
  }))

  const debug = false

  export default {
    name: 'parameter-type-select',

    props: {
      value: String,

      width: {
        type: String,
        default: '10em'
      },
    },

    computed: {
      typeOptions() {
        return typeOptions
      },
    },
  }
</script>
