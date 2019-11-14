<template>
  <div>
    <q-dialog v-model="dialogOpened"
             no-backdrop-dismiss
    >
      <q-layout style="min-width:350px;min-height:300px">
        <q-header>
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
        </q-header>

        <div class="q-mb-sm">
          <q-list>
            <q-item
              v-for="c in selectOptions" :key="c.className"
            >
              <q-item-section>
                <q-checkbox v-model="selection" :val="c.className"/>
              </q-item-section>
              <q-item-section>
                <q-item-label header>{{c.className}}</q-item-label>
                <q-item-label caption>{{c.description}}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="q-ma-xs">
            <asset-class-new-button
              :executor-id="executorId"
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
      </q-layout>
    </q-dialog>

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
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      AssetClassNewButton,
    },

    props: {
      executorId: {
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

      okToSubmit() {
        return _.some(this.selection)
      }
    },


    apollo: {
      allAssetClassesList: {
        query: allAssetClassesList,
        variables() {
          return {
            executorId: this.executorId
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
