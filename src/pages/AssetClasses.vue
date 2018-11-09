<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="AssetClasses" to="/assetclasses"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshAssetClasses"
      />
    </q-breadcrumbs>

    <q-table
      :data="allAssetClassesList"
      :columns="columns"
      row-key="className"
      :rows-per-page-options="rowsPerPage"
      :pagination.sync="pagination"
      :filter="filter"
    >
      <div slot="top-left" slot-scope="props" class="row items-center">
        <div class="col-auto q-headline">
          Asset Classes
        </div>

        <div class="q-ml-md row">
          <q-search
            v-if="allAssetClassesList.length"
            class="col"
            color="secondary"
            v-model="filter"
            placeholder="Filter"
            clearable
          />
        </div>
      </div>
      <div slot="top-right" slot-scope="props" class="fit">
        <asset-class-new-button v-on:created="assetClassCreated"/>
      </div>

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
  import allAssetClassesList from '../graphql/assetClasses.gql'

  const debug = false

  export default {
    components: {
      AssetClassNewButton
    },

    data() {
      return {
        allAssetClassesList: [],
        columns: [
          {
            field: 'className',
            name: 'className',
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
      allAssetClassesList,
    },

    mounted() {
      this.refreshAssetClasses()
    },

    methods: {
      refreshAssetClasses() {
        this.$apollo.queries.allAssetClassesList.refetch()
      },

      assetClassCreated(data) {
        this.refreshAssetClasses()
      }
    },

    watch: {
      allAssetClassesList(val) {
        if (debug) console.log('watch allAssetClassesList=', val)
      }
    }
  }
</script>
