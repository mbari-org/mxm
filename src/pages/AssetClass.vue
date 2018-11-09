<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="AssetClasses" to="/assetclasses"/>
      <q-breadcrumbs-el :label="params.className"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshAssetClass"
      />
    </q-breadcrumbs>

    <div v-if="assetClass">

      <q-card class="q-mb-md">
        <q-card-title>
          Asset Class: <span class="text-bold">{{assetClass.className}}</span>
        </q-card-title>
        <q-card-separator/>
        <q-card-main>
          <description :text="assetClass.description" />
          <q-popup-edit
            v-model="assetClass.description"
            title="Description"
            buttons
            @save="updateDescription"
          >
            <q-field>
              <q-input
                v-model.trim="assetClass.description"
                clearable
                class="bg-green-1"
                type="textarea"
                rows="3"
                :max-height="300"
              />
            </q-field>
          </q-popup-edit>
        </q-card-main>
      </q-card>


      <q-table
        :data="myAssets"
        :columns="assetColumns"
        row-key="assetId"
        :rows-per-page-options="rowsPerPage"
        :pagination.sync="pagination"
        :filter="filter"
      >
        <div slot="top-left" slot-scope="props" class="row items-center">
          <div class="col-auto q-headline">
            Assets
          </div>

          <div class="q-ml-md row">
            <q-search
              v-if="myAssets.length"
              class="col"
              color="secondary"
              v-model="filter"
              placeholder="Filter"
              clearable
            />
          </div>
        </div>

        <div slot="top-right" slot-scope="props" class="fit">
          <asset-new-button
            :asset-class-name="params.className"
            v-on:created="assetCreated"
          />
        </div>

        <q-td slot="body-cell-assetId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link :to="`/assets/${encodeURIComponent(props.row.assetId)}`">
            {{props.row.assetId}}
          </router-link>
        </q-td>

      </q-table>

    </div>

    <div v-else-if="!loading">
      Asset Class not found: {{params.className}}
    </div>
  </q-page>
</template>

<script>
  import description from '../components/description'
  import assetClass from '../graphql/assetClass.gql'
  import AssetNewButton from 'components/asset-new-button'
  import assetClassUpdate from '../graphql/assetClassUpdate.gql'
  import {Notify} from 'quasar'
  import _ from 'lodash'

  const debug = false

  export default {
    components: {
      AssetNewButton,
      description,
    },

    data() {
      return {
        loading: false,
        assetClass: null,
        assetColumns: [
          {
            field: 'assetId',
            name: 'assetId',
            label: 'Asset ID',
            align: 'left',
            sortable: true
          },
          {
            field: 'description',
            name: 'description',
            label: 'Description',
            align: 'left',
            sortable: true
          }
        ],
        rowsPerPage: [0],
        pagination: {
          rowsPerPage: 0
        },
        filter: '',
      }
    },

    computed: {
      params() {
        return this.$route.params
      },

      myAssets() {
        const list = this.assetClass && this.assetClass.assetsByClassNameList || []
        return list
      },
    },

    apollo: {
      assetClass: {
        query: assetClass,
        variables() {
          return {
            className: this.params.className
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          if (data.allAssetClassesList && data.allAssetClassesList.length) {
            return data.allAssetClassesList[0]
          }
          else return null
        },
      },
    },

    mounted() {
      this.refreshAssetClass()
    },

    methods: {
      refreshAssetClass() {
        this.$apollo.queries.assetClass.refetch()
      },

      assetCreated(data) {
        this.refreshAssetClass()
      },

      updateDescription(val) {
        if (debug) console.debug('updateDescription val=', val, 'nodeId=', this.assetClass.nodeId)
        const mutation = assetClassUpdate
        const variables = {
          input: {
            nodeId: this.assetClass.nodeId,
            assetClassPatch: {
              description: val
            }
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateDescription: mutation data=', data)
            this.assetClass.description = val
          })
          .catch((error) => {
            console.error('updateDescription: mutation error=', error)
          })
      },
    },

    watch: {
      '$route'() {
        this.refreshAssetClass()
      },

      assetClass(val) {
        if (debug) console.log('watch assetClass=', val)
      }
    }
  }
</script>
