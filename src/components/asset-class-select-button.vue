<template>
  <div>
    <q-modal v-model="dialogOpened"
             content-css="min-width:350px;min-height:300px"
             no-backdrop-dismiss
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Asset class selection
          </q-toolbar-title>
          <q-btn round dense
                 color="primary"
                 @click="dialogOpened = false"
                 icon="close"
          />
        </q-toolbar>

        <div class="q-ma-sm">
          <q-list link>
            <q-item
              v-for="c in assetClasses" :key="c.className"
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
      <q-tooltip>Asset class selection</q-tooltip>
    </q-btn>

  </div>
</template>

<script>
import AssetClassNewButton from 'components/asset-class-new-button'
import assetClasses from '../graphql/asset_classes.gql'
import mutation from '../graphql/asset_classes_insert.gql'
import { Notify } from 'quasar'

const debug = false

export default {
  components: {
    AssetClassNewButton,
  },

  data () {
    return {
      dialogOpened: false,
      selection: [],
    }
  },

  computed: {
    assetSelectOptions () {
      if (debug) console.debug('this.assetClasses=', this.assetClasses)
      return _.map(this.assetClasses, a => {
        return {
          className: a.className,
          description: a.description,
        }
      })
    },

    okToSubmit () {
      return _.some(this.selection)
    }
  },

  apollo: {
    assetClasses,
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
      this.$apollo.queries.assetClasses.refetch()
    },
  }
}
</script>
