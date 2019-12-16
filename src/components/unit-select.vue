<template>
  <div>
    <q-btn
      v-if="value === 'count'"
      dense no-caps flat
      :label="value"
    />

    <q-btn-dropdown
      v-else
      dense no-caps split flat
    >
      <template v-slot:label>
        <div style="min-width:2em" class="text-left">
          {{ displayUnits }}
        </div>
      </template>

      <div class="q-ma-md column">
        <q-btn
          v-if="(resetValue || '') !== (value || '')"
          no-caps flat
          @click="$emit('input', resetValue)"
        >
          Reset to: {{ resetValue || '(undefined)' }}
        </q-btn>

        <q-input
          color="secondary"
          v-model="filter"
          placeholder="Filter"
          autofocus
          clearable
        />
<!--
        <q-scroll-area
          style="height:300px"
        >
-->
          <q-list separator>
            <q-item
              v-for="(u, index) in unitOptions" :key="index"
              clickable v-close-popup
              @click="$emit('input', u.unitName)"
            >
              <q-item-section>
                <q-item-label>{{u.abbreviation}}</q-item-label>
                <q-item-label caption>{{u.unitName}}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
<!--
        </q-scroll-area>
-->
      </div>
    </q-btn-dropdown>
  </div>
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

      resetValue: {
        type: String,
        required: false
      },
    },

    data: () => ({
      filter: '',
    }),

    computed: {
      unitInfo() {
        return this.unitsByName[this.value]
      },

      displayUnits() {
        return get(this.unitInfo, 'abbreviation') || this.value
      },

      unitOptions() {
        let units = this.units
        const baseUnit = get(this.unitInfo, 'baseUnit')
        if (baseUnit) {
          units = filter(units, u =>
            u.baseUnit === baseUnit ||
            u.unitName === baseUnit ||
            u.unitName === this.value
          )
        }
        if (this.filter) {
          const lc = this.filter.toLowerCase()
          units = filter(units, u =>
            u.unitName.toLowerCase().indexOf(lc) >= 0 ||
            u.abbreviation && u.abbreviation.toLowerCase().indexOf(lc) >= 0
          )
        }
        return units
      },
    },
  }
</script>
