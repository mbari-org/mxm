<template>

  <div>
    <q-select
      style="width:17em"
      class="bg-light-blue-1 col-auto"
      v-model="assedId"
      :options="options"
      @input="atInput"
      placeholder="Select asset"
    />
  </div>

</template>

<script>
  const debug = false

  export default {
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
      }
    },

    computed: {
      options() {
        const list = []
        _.each(this.assetClasses, e => {
          const instances = _.get(e, 'assetClassByExecutorIdAndAssetClassName.assetsByExecutorIdAndClassNameList') || []
          if (debug) console.debug(':: instances=', instances)
          _.each(instances, i => {
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
      atInput(val) {
        this.$emit('input', val)
      },
    },

    watch: {
      assetClasses(val) {
        if (debug) console.log('asset-select: watch assetClasses=', val)
      }
    },
  }
</script>
