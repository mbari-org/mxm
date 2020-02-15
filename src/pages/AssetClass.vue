<template>
  <q-page class="q-pa-md">
    <div v-if="assetClass">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-x-sm">
            <div>Asset Class:</div>
            <div class="text-bold">{{assetClass.className}}</div>
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <mxm-markdown
            :text="assetClass.description"
            :start-markdown="assetClass.providerByProviderId.descriptionFormat === 'markdown'"
          />
        </q-card-section>
      </q-card>

      <q-table
        :data="myAssets"
        :columns="assetColumns"
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
              v-if="myAssets.length"
              class="col"
              color="secondary"
              v-model="filter"
              placeholder="Filter"
              clearable
            />
          </div>
        </div>

        <q-td slot="body-cell-assetId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link
            style="text-decoration:none"
            :to="$utl.routeLoc([params.providerId, 'a', props.row.assetId])"
          >
            {{props.row.assetId}}
          </router-link>
        </q-td>

        <q-td slot="body-cell-description" slot-scope="props" :props="props"
        >
          <mxm-markdown
            simple hide-empty :text="props.value"
            :start-markdown="assetClass.providerByProviderId.descriptionFormat === 'markdown'"
          />
        </q-td>
      </q-table>

    </div>

    <div v-else-if="!loading">
      Asset Class not found: {{params.className}}
    </div>
  </q-page>
</template>

<script>
  import assetClassGql from '../graphql/assetClass.gql'

  const debug = false

  export default {
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
        const list = this.assetClass && this.assetClass.assetsByProviderIdAndClassNameList || []
        return list
      },
    },

    apollo: {
      assetClass: {
        query: assetClassGql,
        variables() {
          return {
            providerId: this.params.providerId,
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

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [
            [this.params.providerId, [this.params.providerId]],
            ['AssetClasses', [this.params.providerId, 'ac']],
            [this.params.className],
          ],
          refresh: this.refreshAssetClass
        })
      },

      refreshAssetClass() {
        if (this.$apollo.queries.assetClass) {
          this.$apollo.queries.assetClass.refetch()
        }
      },
    },

    watch: {
      params: {
        handler(val) {
          console.warn('WATCH params=', val)
          this.setBreadcrumbs()
          this.refreshAssetClass()
        },
        deep: true,
        immediate: true,
      },
    },
  }
</script>
