<template>
  <q-page class="q-pa-md">
    <q-table
      :data="allAssetClassesList"
      :columns="columns"
      row-key="className"
      :rows-per-page-options="rowsPerPage"
      :pagination.sync="pagination"
      :filter="filter"
      separator="cell"
      no-data-label="No asset classes defined"
    >
      <div slot="top-left" slot-scope="props" class="row items-center">
        <div class="col-auto text-h5">
          Asset Classes
        </div>

        <div class="q-ml-md row">
          <q-input
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
        <asset-class-new-button
          :executor-id="params.executorId"
          @created="assetClassCreated"
        />
      </div>

      <q-td slot="body-cell-className" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link
          style="text-decoration:none"
          :to="$utl.routeLoc([params.executorId, 'assetclasses', props.row.className])"
        >
          {{props.row.className}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-description" slot-scope="props" :props="props"
      >
        <mxm-markdown simple hide-empty :text="props.value"/>
      </q-td>
    </q-table>
  </q-page>
</template>

<script>
  import allAssetClassesList from '../graphql/assetClasses.gql'
  import AssetClassNewButton from 'components/asset-class-new-button'

  const debug = false

  export default {
    components: {
      AssetClassNewButton,
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

    computed: {
      params() {
        return this.$route.params
      },
    },

    apollo: {
      allAssetClassesList: {
        query: allAssetClassesList,
        variables() {
          return {
            executorId: this.params.executorId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          return data.allAssetClassesList || []
        },
      },
    },

    mounted() {
      this.$store.commit('utl/setBreadcrumbs', {
        elements: [
          ['Home', []],
          [this.params.executorId, [this.params.executorId]],
          ['AssetClasses'],
        ],
        refresh: this.refreshAssetClasses
      })

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
