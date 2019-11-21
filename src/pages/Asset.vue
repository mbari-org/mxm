<template>
  <q-page class="q-pa-md">
    <div v-if="asset">
      <q-card class="q-mb-md">
        <q-card-section>
          Asset ID: <span class="text-bold">{{asset.assetId}}</span>

          (class:
          <router-link
            style="text-decoration:none"
            :to="$utl.routeLoc([params.executorId, 'assetclasses', asset.className])"
          >{{ asset.className }}</router-link>)
        </q-card-section>

        <q-separator/>
        <q-card-section>
          <mxm-markdown
            :text="asset.description"
            editable
            @saveDescription="updateDescription"
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
  import asset from '../graphql/asset.gql'
  import AssetNewButton from 'components/asset-new-button'
  import assetUpdate from '../graphql/assetUpdate.gql'

  const debug = false

  export default {
    components: {
      AssetNewButton,
    },

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
        query: asset,
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

    mounted() {
      this.$store.commit('utl/setBreadcrumbs', {
        elements: [
          ['Home', []],
          [this.params.executorId, [this.params.executorId]],
          ['Assets', [this.params.executorId, 'assets']],
          [this.params.assetId],
        ],
        refresh: this.refreshAsset
      })

      this.refreshAsset()
    },

    methods: {
      refreshAsset() {
        this.$apollo.queries.asset.refetch()
      },

      assetCreated(data) {
        this.refreshAsset()
      },

      updateDescription(val) {
        if (debug) console.debug('updateDescription val=', val, 'id=', this.asset.id)
        const mutation = assetUpdate
        const variables = {
          input: {
            id: this.asset.id,
            assetPatch: {
              description: val
            }
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateDescription: mutation data=', data)
            this.asset.description = val
          })
          .catch((error) => {
            console.error('updateDescription: mutation error=', error)
          })
      },
    },

    watch: {
      '$route'() {
        this.refreshAsset()
      },

      asset(val) {
        if (debug) console.log('watch asset=', val)
      }
    }
  }
</script>
