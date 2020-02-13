<template>
  <q-page class="q-pa-md">
    <q-table
      :data="allAssetsList"
      :columns="columns"
      row-key="assetId"
      :rows-per-page-options="rowsPerPage"
      :pagination.sync="pagination"
      :filter="filter"
      separator="cell"
      no-data-label="No assets defined"
    >
      <div slot="top-left" slot-scope="props" class="row items-center">
        <div class="col-auto text-h5">
          Assets
        </div>

        <div class="q-ml-md row">
          <q-input
            v-if="allAssetsList.length"
            class="col"
            color="secondary"
            v-model="filter"
            placeholder="Filter"
            clearable
          />
        </div>
      </div>

      <q-td slot="body-cell-assetId" slot-scope="props" :props="props"
            style="width:5px; vertical-align:top"
      >
        <router-link
          style="text-decoration:none"
          :to="$utl.routeLoc([params.providerId, 'a', props.row.assetId])"
        >
          {{props.row.assetId}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-className" slot-scope="props" :props="props"
            style="width:5px; vertical-align:top"
      >
        <router-link
          style="text-decoration:none"
          :to="$utl.routeLoc([params.providerId, 'ac', props.row.className])"
        >
          {{props.row.className}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-description" slot-scope="props" :props="props"
            style="vertical-align:top"
      >
        <mxm-markdown
          simple hide-empty :text="props.value"
          :start-markdown="props.row.assetClassByProviderIdAndClassName.providerByProviderId.descriptionFormat === 'markdown'"
        />
      </q-td>

    </q-table>
  </q-page>
</template>

<script>
  import allAssetsListGql from '../graphql/assets.gql'

  const debug = false

  export default {
    components: {
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

    computed: {
      params() {
        return this.$route.params
      },
    },

    apollo: {
      allAssetsList: {
        query: allAssetsListGql,
        variables() {
          return {
            providerId: this.params.providerId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          return data.allAssetsList || []
        },
      },
    },

    mounted() {
      this.$store.commit('utl/setBreadcrumbs', {
        elements: [
          [this.params.providerId, [this.params.providerId]],
          ['Assets'],
        ],
        refresh: this.refreshAssets
      })

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
