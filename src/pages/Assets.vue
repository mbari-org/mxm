<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Assets" to="/assets"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshAssets"
      />
    </q-breadcrumbs>

    <q-table
      :data="allAssetsList"
      :columns="columns"
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
            v-if="allAssetsList.length"
            class="col"
            color="secondary"
            v-model="filter"
            placeholder="Filter"
            clearable
          />
        </div>
      </div>

      <div slot="top-right" slot-scope="props" class="fit">
        <asset-class-new-button v-on:created="assetCreated"/>
      </div>

      <q-td slot="body-cell-assetId" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link :to="`/assets/${encodeURIComponent(props.row.assetId)}`">
          {{props.row.assetId}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-className" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link :to="`/assetclasses/${encodeURIComponent(props.row.className)}`">
          {{props.row.className}}
        </router-link>
      </q-td>

    </q-table>
  </q-page>
</template>

<script>
  import AssetClassNewButton from 'components/asset-class-new-button'
  import allAssetsList from '../graphql/assets.gql'

  const debug = false

  export default {
    components: {
      AssetClassNewButton
    },

    data() {
      return {
        allAssetsList: [],
        columns: [
          {
            field: 'assetId',
            name: 'assetId',
            label: 'Name',
            align: 'left',
            sortable: true
          },
          {
            field: 'description',
            name: 'description',
            label: 'Description',
            align: 'left',
            sortable: true
          },
          {
            field: 'className',
            name: 'className',
            label: 'Class',
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

    apollo: {
      allAssetsList,
    },

    mounted() {
      this.refreshAssets()
    },

    methods: {
      refreshAssets() {
        this.$apollo.queries.allAssetsList.refetch()
      },

      assetCreated(data) {
        this.refreshAssets()
      }
    },

    watch: {
      allAssetsList(val) {
        if (debug) console.log('watch allAssetsList=', val)
      }
    }
  }
</script>
