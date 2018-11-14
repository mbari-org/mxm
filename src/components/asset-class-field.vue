<!-- TODO component not used; re-enable it? -->

<template>
  <div class="row">
    <em v-if="retrieving" style="width:14em">
      {{className}}
    </em>
    <q-select
      v-else
      style="width:17em"
      class="bg-light-blue-1 col-auto"
      v-model="className"
      :options="options"
      @input="atInput"
      placeholder="Select class"
    />
    <div class="q-ma-xs">
      <asset-class-new-button
        v-on:created="assetClassCreated"
      />
    </div>
  </div>
</template>

<script>
import assetClasses from '../graphql/assetClasses.gql'
import AssetClassNewButton from 'components/asset-class-new-button'

export default {
  components: {
    AssetClassNewButton,
  },

  props: {
    executorId: {
      type: String,
      required: true
    },
    value: String,
  },

  data () {
    return {
      className: this.value,
      assetClasses: []
    }
  },

  apollo: {
    assetClasses
  },

  computed: {
    retrieving () {
      return false // TODO
    },


    options () {
      console.debug('this.assetClasses=', this.assetClasses)
      return _.map(this.assetClasses, (c) => {
        return {
          label: c.className,  // + c.description ? ` (${c.description})` : ''
          value: c.className,
        }
      })
    },
  },

  mounted () {
    this.className = this.value
    this.refreshList()
  },

  methods: {
    refreshList () {
      this.$apollo.queries.assetClasses.refetch()
    },

    atInput(val) {
      this.$emit('input', val)
    },

    assetClassCreated (data) {
      console.debug('assetClassCreated: data=', data)
      this.className = data.className
      this.assetClasses.push(data)
    },
  },
}
</script>
