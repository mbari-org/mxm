<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs active-color="secondary" color="light" class="q-mb-sm">
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el :label="params.executorId" :to="`/${encodeURIComponent(params.executorId)}`"/>
      <q-breadcrumbs-el label="AssetClasses" :to="`/${encodeURIComponent(params.executorId)}/assetclasses`"/>
      <q-breadcrumbs-el :label="params.className"/>
      <q-btn
        dense round icon="refresh" class="q-ml-lg" size="sm"
        @click="refreshAssetClass"
      />
    </q-breadcrumbs>

    <div v-if="assetClass">

      <q-card class="q-mb-md">
        <q-card-section>
          Asset Class: <span class="text-bold">{{assetClass.className}}</span>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <mxm-markdown :text="assetClass.description"/>
          <q-popup-edit
            v-model="assetClass.description"
            title="Description"
            buttons persistent
            @save="updateDescription"
          >
            <q-input
              v-model.trim="assetClass.description"
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
            :executor-id="params.executorId"
            :asset-class-name="params.className"
            v-on:created="assetCreated"
          />
        </div>

        <q-td slot="body-cell-assetId" slot-scope="props" :props="props"
              style="width:5px"
        >
          <router-link
            style="text-decoration:none"
            :to="`/${encodeURIComponent(params.executorId)}/assets/${encodeURIComponent(props.row.assetId)}`"
          >
            {{props.row.assetId}}
          </router-link>
        </q-td>

        <q-td slot="body-cell-description" slot-scope="props" :props="props"
        >
          <mxm-markdown simple hide-empty :text="props.value"/>
        </q-td>
      </q-table>

    </div>

    <div v-else-if="!loading">
      Asset Class not found: {{params.className}}
    </div>
  </q-page>
</template>

<script>
  import assetClass from '../graphql/assetClass.gql'
  import AssetNewButton from 'components/asset-new-button'
  import assetClassUpdate from '../graphql/assetClassUpdate.gql'
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
        const list = this.assetClass && this.assetClass.assetsByExecutorIdAndClassNameList || []
        return list
      },
    },

    apollo: {
      assetClass: {
        query: assetClass,
        variables() {
          return {
            executorId: this.params.executorId,
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
        const mutation = assetClassUpdate
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

      assetClass(val) {
        if (debug) console.log('watch assetClass=', val)
      }
    }
  }
</script>
