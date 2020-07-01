<template>
  <q-select
    filled
    dense
    class="bg-light-blue-1 col-auto"
    v-model="assedId"
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
  import each from 'lodash/each'
  import get from 'lodash/get'

  const debug = false

  export default {
    name: 'asset-select',

    props: {
      assetClasses: {
        type: Array,
        required: true
      },
      value: String,
    },

    data() {
      return {
        assedId: this.value,
        theOptions: [],
      }
    },

    computed: {
      options() {
        const list = []
        each(this.assetClasses, e => {
          const instances = get(e, 'assetClassByProviderIdAndAssetClassName.assetsByProviderIdAndClassNameList') || []
          if (debug) console.debug(':: instances=', instances)
          each(instances, i => {
            list.push({
              label: `${i.assetId} (${e.assetClassName})`,
              value: i.assetId,
            })
          })
        })
        return list
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
