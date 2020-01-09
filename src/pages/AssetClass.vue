<template>
  <q-page class="q-pa-md">
    <div v-if="assetClass">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-x-sm">
            <div>Asset Class:</div>
            <div class="text-bold">{{assetClass.className}}</div>
            <div class="q-ml-xl">
              <q-btn
                class="q-ml-md"
                color="red"
                size="xs"
                dense round icon="delete"
                @click="deleteAssetClass"
              />
            </div>
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <mxm-markdown
            :text="assetClass.description"
            :start-markdown="assetClass.providerByProviderId.descriptionFormat === 'markdown'"
            editable
            @saveDescription="updateDescription"
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

        <div slot="top-right" slot-scope="props" class="fit">
          <asset-new-button
            :provider-id="params.providerId"
            :asset-class-name="params.className"
            @created="assetCreated"
          />
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
  import assetClassUpdateGql from '../graphql/assetClassUpdate.gql'
  import assetClassDeleteGql from '../graphql/assetClassDelete.gql'

  import AssetNewButton from 'components/asset-new-button'

  const debug = false

  export default {
    components: {
      AssetNewButton,
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

    mounted() {
      this.$store.commit('utl/setBreadcrumbs', {
        elements: [
          ['Home', []],
          [this.params.providerId, [this.params.providerId]],
          ['AssetClasses', [this.params.providerId, 'ac']],
          [this.params.className],
        ],
        refresh: this.refreshAssetClass
      })

      this.refreshAssetClass()
    },

    methods: {
      refreshAssetClass() {
        this.$apollo.queries.assetClass.refetch()
      },

      assetCreated(data) {
        this.refreshAssetClass()
      },

      updateDescription(val) {
        if (debug) console.debug('updateDescription val=', val, 'id=', this.assetClass.id)
        const mutation = assetClassUpdateGql
        const variables = {
          input: {
            id: this.assetClass.id,
            assetClassPatch: {
              description: val
            }
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('updateDescription: mutation data=', data)
            this.assetClass.description = val
            this.$q.notify({
              message: `Asset class description saved`,
              timeout: 1000,
              position: 'top',
              color: 'info',
            })
          })
          .catch((error) => {
            console.error('updateDescription: mutation error=', error)
          })
      },

      deleteAssetClass() {
        console.log('deleteAssetClass: assetClass=', this.assetClass)
        this.$q.dialog({
          title: 'Confirm',
          message: `Delete asset class '${this.assetClass.className}'?`,
          color: 'negative',
          ok: `Yes, delete '${this.assetClass.className}'`,
          cancel: true,
          focus: 'cancel',
        }).onOk(() => {
          const mutation = assetClassDeleteGql
          const variables = {
            input: {
              id: this.assetClass.id
            }
          }
          this.$apollo.mutate({mutation, variables})
              .then(data => {
                if (debug) console.debug('deleteAssetClass: mutation data=', data)
                this.$q.notify({
                  message: `Asset class deleted: '${this.assetClass.className}'`,
                  timeout: 2000,
                  position: 'top',
                  color: 'info',
                })
                this.$utl.replace([this.params.providerId, 'ac'])
              })
              .catch(error => {
                console.error('deleteAssetClass: mutation error=', error)
                this.$q.notify({
                  message: `Asset class deletion error: ${JSON.stringify(error)}`,
                  timeout: 0,
                  closeBtn: 'Close',
                  color: 'warning',
                })
              })
        })
      },
    },

    watch: {
      '$route'() {
        this.refreshAssetClass()
      },

      assetClass(val) {
        if (debug) console.log('watch assetClass=', val)
      }
    }
  }
</script>
