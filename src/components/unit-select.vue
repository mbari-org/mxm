<template>
  <q-select
    dense options-dense
    :options="options"
    placeholder="Select"
    :value="displayUnits"
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

      unitsByName: {
        type: Object,
        required: true
      },

      value: {
        type: String,
        required: true
      },
    },

    computed: {
      unitInfo() {
        return this.unitsByName[this.value]
      },

      displayUnits() {
        return get(this.unitInfo, 'abbreviation') || this.value
      },

      options() {
        let units = this.units
        if (this.value === 'count') {
          // 'count' looks like only by itself per TethysDash behavior.
          units = filter(units, {unitName: this.value})
        }
        else {
          const baseUnit = get(this.unitInfo, 'baseUnit')
          if (baseUnit) {
            units = filter(units, u =>
              u.baseUnit === baseUnit ||
              u.unitName === baseUnit ||
              u.unitName === this.value
            )
          }
        }
        return map(units, u => ({
          label: u.abbreviation,
          value: u.unitName,
        }))

      },
    },
  }
</script>
