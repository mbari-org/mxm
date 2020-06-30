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

      <q-td slot="body-cell-className" slot-scope="props" :props="props"
            style="width:5px;vertical-align:top"
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
          :start-markdown="props.row.providerByProviderId.descriptionFormat === 'markdown'"
        />
      </q-td>
    </q-table>
  </q-page>
</template>

<script>
  import allAssetClassesListGql from '../graphql/assetClasses.gql'

  const debug = false

  export default {
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
        query: allAssetClassesListGql,
        variables() {
          return {
            providerId: this.params.providerId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          return data.allAssetClassesList || []
        },
      },
    },

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [
            [this.params.providerId, [this.params.providerId]],
            ['AssetClasses'],
          ],
          refresh: this.refreshAssetClasses
        })
      },

      refreshAssetClasses() {
        if (this.$apollo.queries.allAssetClassesList) {
          this.$apollo.queries.allAssetClassesList.refetch()
        }
      },
    },

    watch: {
      params: {
        handler(val) {
          console.warn(`WATCH params=`, val)
          this.setBreadcrumbs()
          this.refreshAssetClasses()
        },
        deep: true,
        immediate: true,
      },
    },
  }
</script>
