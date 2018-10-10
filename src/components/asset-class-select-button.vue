<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:350px;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            <span v-if="exclude && exclude.length">
              Add associated asset classes
            </span>
            <span v-else>
              Asset class selection
            </span>
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-mb-sm">
          <q-list link>
            <q-item
              v-for="c in selectOptions" :key="c.className"
            >
              <q-item-side>
                <q-checkbox v-model="selection" :val="c.className"/>
              </q-item-side>
              <q-item-main>
                <q-item-tile label>{{c.className}}</q-item-tile>
                <q-item-tile sublabel>{{c.description}}</q-item-tile>
              </q-item-main>
            </q-item>
          </q-list>

          <div class="q-ma-xs">
            <asset-class-new-button
              v-on:created="assetClassCreated"
            />
          </div>
        </div>

        <q-toolbar slot="footer" color="flat">
          <q-toolbar-title/>
          <q-btn dense
                 :color="okToSubmit ? 'primary' : 'light'"
                 @click="submit"
                 label="OK"
                 :disable="!okToSubmit"
          />
        </q-toolbar>
      </q-modal-layout>
    </q-modal>

    <q-btn
      color="primary"
      icon="add"
      dense round no-caps size="sm"
      @click="openDialog"
    >
      <q-tooltip>
        <span v-if="exclude && exclude.length">
          Add associated asset classes
        </span>
        <span v-else>
          Asset class selection
        </span>
      </q-tooltip>
    </q-btn>

  </div>
</template>

<script>
import AssetClassNewButton from 'components/asset-class-new-button'
import allAssetClassesList from '../graphql/assetClasses.gql'
import { Notify } from 'quasar'

const debug = false

export default {
  components: {
    AssetClassNewButton,
  },

  props: {
    exclude: {
      type: Array,
      required: false
    }
  },

  data () {
    return {
      dialogOpened: false,
      selection: [],
      allAssetClassesList: [],
    }
  },

  computed: {
    selectOptions () {
      if (debug) console.debug('selectOptions: allAssetClassesList=', this.allAssetClassesList)
      const all = _.map(this.allAssetClassesList, a => ({
        className: a.className,
        description: a.description,
      }))
      if (this.exclude && this.exclude.length) {
        return _.filter(all, c => !_.includes(this.exclude, c.className))
      }
      else {
        return all
      }
    },

    okToSubmit () {
      return _.some(this.selection)
    }
  },

  apollo: {
    allAssetClassesList,
  },

  methods: {
    openDialog () {
      this.selection = []
      this.dialogOpened = true
    },

    submit () {
      this.dialogOpened = false
      this.$emit('selection', this.selection)
    },

    assetClassCreated (data) {
      if (debug) console.debug('assetClassCreated: data=', data)
      this.$apollo.queries.allAssetClassesList.refetch()
    },
  },

  watch: {
    allAssetClassesList (val) {
      console.log('watch allAssetClassesList=', val)
    }
  },
}
</script>
