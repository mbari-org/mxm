<template>
  <q-select
    filled
    dense
    class="bg-light-blue-1 col-auto"
    v-model="missionTplId"
    :options="theOptions"
    use-input
    input-debounce="0"
    clearable
    @filter="filterFn"
    @input="val => val && $emit('input', val.value)"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
  import map from 'lodash/map'

  const debug = false

  export default {
    name: 'mission-tpl-select',

    props: {
      missionTpls: {
        type: Array,
        required: true
      },
      value: String,
    },

    data() {
      return {
        missionTplId: this.value,
        theOptions: [],
      }
    },

    computed: {
      options() {
        if (debug) console.debug('missionTpls=', this.missionTpls)
        return map(this.missionTpls, e => {
          return {
            label: e.missionTplId,
            value: e.missionTplId,
          }
        })
      },
    },

    methods: {
      filterFn(val, update) {
        update(() => {
          if (val) {
            const lc = val.toLowerCase()
            this.theOptions = this.options.filter(o => o.label.toLowerCase().indexOf(lc) > -1)
          }
          else {
            this.theOptions = this.options
          }
        })
      },
    },
  }
</script>
