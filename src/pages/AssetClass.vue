<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="AssetClasses" to="/assetclasses"/>
      <q-breadcrumbs-el :label="params.className" :to="`/assetclasses/${encodeURIComponent(params.className)}`"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshAssetClass"
      />
    </q-breadcrumbs>

    <div v-if="assetClass">

      <q-card class="q-mb-md">
        <q-card-title>
          Asset Class: {{assetClass.className}}
        </q-card-title>
        <q-card-separator />
        <q-card-main>
          <p class="text-italic">
            {{assetClass.description}}
          </p>
        </q-card-main>
      </q-card>


      <q-table
        title="Assets of this class"
        :data="myAssets"
        :columns="assetColumns"
        row-key="assetId"
      >
        <div slot="top-right" slot-scope="props" class="fit">
          <asset-new-button
            :asset-class-name="params.className"
            v-on:created="assetCreated"
          />
        </div>
      </q-table>

    </div>

    <div v-else-if="!loading">
      Asset Class not found: {{params.className}}
    </div>
  </q-page>
</template>

<script>
  import assetClass from '../graphql/assetClass.gql'
  import AssetNewButton from 'components/asset-new-button'
  import { Notify } from 'quasar'
  import _ from 'lodash'

  const debug = true

  export default {
    components: {
      AssetNewButton
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
        ]
      }
    },

    computed: {
      params() {
        return this.$route.params
      },

      myAssets () {
        const list = this.assetClass && this.assetClass.assetsByClassNameList || []
        return list
      },
    },

    apollo: {
      assetClass: {
        query: assetClass,
        variables () {
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
      refreshAssetClass () {
        this.$apollo.queries.assetClass.refetch()
      },

      assetCreated (data) {
        this.refreshAssetClass()
      }
    },

    watch: {
      '$route' () {
        this.refreshAssetClass()
      },

      assetClass (val) {
        console.log('watch assetClass=', val)
      }
    }
  }
</script>
