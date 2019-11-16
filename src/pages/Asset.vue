<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light" class="q-mb-sm">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/${encodeURIComponent(params.executorId)}`"/>
      <q-breadcrumbs-el label="Assets" :to="`/${encodeURIComponent(params.executorId)}/assets`"/>
      <q-breadcrumbs-el :label="params.assetId"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshAssetClass"
      />
    </q-breadcrumbs>

    <div v-if="asset">

      <q-card class="q-mb-md">
        <q-card-section>
          Asset ID: <span class="text-bold">{{asset.assetId}}</span>

          (class:
          <router-link
            style="text-decoration:none"
            :to="`/${encodeURIComponent(params.executorId)}/assetclasses/${encodeURIComponent(asset.className)}`"
          >{{ asset.className }}</router-link>)
        </q-card-section>

        <q-separator/>
        <q-card-section>
          <mxm-markdown :text="asset.description"/>
          <q-popup-edit
            v-model="asset.description"
            title="Description"
            buttons persistent
            @save="updateDescription"
          >
            <q-input
              v-model.trim="asset.description"
              clearable
              class="bg-green-1 q-pl-md q-pr-md"
              style="font-family:monospace"
              type="textarea"
              rows="3"
              :max-height="300"
              autofocus @keyup.enter.stop
            />
          </q-popup-edit>
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
  import MxmMarkdown from 'components/mxm-markdown'

  const debug = false

  export default {
    components: {
      AssetNewButton,
      MxmMarkdown,
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
      this.refreshAssetClass()
    },

    methods: {
      refreshAssetClass() {
        this.$apollo.queries.asset.refetch()
      },

      assetCreated(data) {
        this.refreshAssetClass()
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
        this.refreshAssetClass()
      },

      asset(val) {
        if (debug) console.log('watch asset=', val)
      }
    }
  }
</script>
