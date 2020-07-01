<template>
  <div>
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

    <utl-dialog
      :dialog-opened="dialogOpened"
      :title="exclude && exclude.length ? 'Add associated asset classes' : 'Asset class selection'"
      :ok-to-submit="!!okToSubmit"
      :ok-to-dismiss="!!okToDismiss"
      @submit="submit"
      @dialogClosing="dialogOpened = false"
    >
      <div
        class="column q-gutter-sm"
      >
        <q-list separator>
          <q-item
            v-for="c in selectOptions" :key="c.className"
            clickable @click="clickOption(c)"
          >
            <q-item-section avatar>
              <q-checkbox v-model="selection" :val="c.className"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{c.className}}</q-item-label>
              <q-item-label caption>{{c.description}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="q-ma-md">
          <asset-class-new-button
            :provider-id="providerId"
            @created="assetClassCreated"
          />
        </div>
      </div>
    </utl-dialog>
  </div>
</template>

<script>
  import allAssetClassesListGql from '../graphql/assetClasses.gql'

  import AssetClassNewButton from 'components/asset-class-new-button'

  import map from 'lodash/map'
  import filter from 'lodash/filter'
  import includes from 'lodash/includes'
  import indexOf from 'lodash/indexOf'
  import remove from 'lodash/remove'
  import some from 'lodash/some'

  const debug = false

  export default {
    components: {
      AssetClassNewButton,
    },

    props: {
      providerId: {
        type: String,
        required: true
      },
      exclude: {
        type: Array,
        required: false
      }
    },

    data() {
      return {
        dialogOpened: false,
        selection: [],
        allAssetClassesList: [],
      }
    },

    computed: {
      selectOptions() {
        if (debug) console.debug('selectOptions: allAssetClassesList=', this.allAssetClassesList)
        const all = map(this.allAssetClassesList, a => ({
          className: a.className,
          description: a.description,
        }))
        if (this.exclude && this.exclude.length) {
          return filter(all, c => !includes(this.exclude, c.className))
        }
        else {
          return all
        }
      },

      okToSubmit() {
        return some(this.selection)
      },

      okToDismiss() {
        return true // TODO
      },
    },

    apollo: {
      allAssetClassesList: {
        query: allAssetClassesListGql,
        variables() {
          return {
            providerId: this.providerId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          return data.allAssetClassesList
        },
      },
    },

    methods: {
      openDialog() {
        this.selection = []
        this.dialogOpened = true
        this.$apollo.queries.allAssetClassesList.refetch()
      },

      submit() {
        this.dialogOpened = false
        this.$emit('selection', this.selection)
      },

      clickOption(c) {
        const idx = indexOf(this.selection, c.className)
        if (idx >= 0) {
          this.selection.splice(idx, 1)
        }
        else {
          this.selection.push(c.className)
        }
      },

      assetClassCreated(data) {
        if (debug) console.debug('assetClassCreated: data=', data)
        this.$apollo.queries.allAssetClassesList.refetch()
      },
    },

    watch: {
      allAssetClassesList(val) {
        if (debug) console.log('watch allAssetClassesList=', val)
      }
    },
  }
</script>
