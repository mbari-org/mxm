<template>
  <q-select
    dense options-dense
    :options="options"
    placeholder="Select"
    :value="value"
    @change="val => { $emit('change', val.value) }"
    @input="val => { $emit('input', val.value) }"
  >
    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents"
      >
        <q-item-section>
          <q-item-label v-html="scope.opt.label">
          </q-item-label>
          <q-tooltip>{{ scope.opt.value }}</q-tooltip>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
  import get from 'lodash/get'
  import map from 'lodash/map'
  import filter from 'lodash/filter'

  const debug = true

  export default {
    props: {
      units: {
        type: Array,
        required: true
      },

      baseUnit: {
        type: String,
        required: false
      },

      value: String,
    },

    data: () => ({
      options: [],
    }),

    mounted() {
      let units = this.units
      if (this.value === 'count') {
        units = filter(units, {unitName: this.value})
      }
      else if (this.baseUnit) {
        units = filter(units, {baseUnit: this.baseUnit})
      }
      this.options = map(units, u => ({
        label: u.abbreviation,
        value: u.unitName,
      }))
    },
  }
</script>
