<template>
  <q-page class="q-pa-md">
    <div v-if="asset">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-x-sm">
            <div>Asset ID:</div>
            <div class="text-bold">{{asset.assetId}}</div>
            <div>
              (class:
              <router-link
                style="text-decoration:none"
                :to="$utl.routeLoc([params.providerId, 'ac', asset.className])"
              >{{ asset.className }}</router-link>)
            </div>
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section>
          <mxm-markdown
            :text="asset.description"
            :start-markdown="asset.assetClassByProviderIdAndClassName.providerByProviderId.descriptionFormat === 'markdown'"
          />
        </q-card-section>
      </q-card>

    </div>

    <div v-else-if="!loading">
      Asset: {{params.assetId}}
    </div>
  </q-page>
</template>

<script>
  import assetGql from '../graphql/asset.gql'

  const debug = false

  export default {
    data() {
      return {
        loading: false,
        asset: null,
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
    },

    apollo: {
      asset: {
        query: assetGql,
        variables() {
          return {
            assetId: this.params.assetId
          }
        },
        update(data) {
          if (debug) console.log('update: data=', data)
          if (data.allAssetsList && data.allAssetsList.length) {
            return data.allAssetsList[0]
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
            ['Assets', [this.params.providerId, 'a']],
            [this.params.assetId],
          ],
          refresh: this.refreshAsset
        })
      },

      refreshAsset() {
        if (this.$apollo.queries.asset) {
          this.$apollo.queries.asset.refetch()
        }
      },
    },

    watch: {
      params: {
        handler(val) {
          console.warn('WATCH params=', val)
          this.setBreadcrumbs()
          this.refreshAsset()
        },
        deep: true,
        immediate: true,
      },
    },
  }
</script>
