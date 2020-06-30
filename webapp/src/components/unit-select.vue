<template>
  <div v-if="editable">
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

      <div class="q-mt-xs column">
        <q-btn
          v-if="(resetValue || '') !== (value || '')"
          no-caps dense flat
          v-close-popup
          @click="$emit('input', resetValue)"
        >
          <div class="text-left">
            Reset to: {{ resetValue || '(undefined)' }}
          </div>
        </q-btn>

        <q-input
          v-if="units.length > 1"
          class="q-ml-sm"
          color="secondary"
          v-model="filter"
          placeholder="Filter"
          autofocus
          clearable
        />

        <q-list dense>
          <q-item
            v-for="(u, index) in unitOptions" :key="index"
            clickable v-close-popup
            @click="$emit('input', u.unitName)"
          >
            <q-item-section>
              <q-item-label>
                {{u.abbreviation}}
                <i class="text-grey">- {{u.unitName}}</i>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

      </div>
    </q-btn-dropdown>
  </div>

  <div v-else>
    {{ displayUnits }}
    <q-tooltip>{{ value }}</q-tooltip>
  </div>
</template>

<script>
  import get from 'lodash/get'
  import map from 'lodash/map'
  import filter from 'lodash/filter'
  import orderBy from "lodash/orderBy"

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

      editable: {
        type: Boolean,
        default: false
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
        const baseUnit = get(this.unitInfo, 'baseUnit') || get(this.unitInfo, 'unitName')
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
        if (baseUnit === 'second') {
          // a little "exception" to show the long abbreviations at the end:
          units = orderBy(units, u => u.abbreviation.length)
        }
        return units
      },
    },
  }
</script>
