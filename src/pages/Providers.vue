<template>
  <q-page class="q-pa-md">
    <q-table
      :data="allProvidersList"
      :columns="columns"
      row-key="name"
      :rows-per-page-options="rowsPerPage"
      :pagination.sync="pagination"
      separator="cell"
      no-data-label="No providers registered"
    >
      <div slot="top-left" slot-scope="props" class="row items-center">
        <div class="col-auto text-h5">
          Providers
        </div>
      </div>

      <div slot="top-right" slot-scope="props" class="fit">
        <provider-new-button @created="providerCreated"/>
      </div>

      <q-td slot="body-cell-providerId" slot-scope="props" :props="props"
            style="width:5px"
      >
        <router-link
          style="text-decoration:none"
          :to="$utl.routeLoc([props.row.providerId])"
        >
          {{props.row.providerId}}
        </router-link>
      </q-td>

      <q-td slot="body-cell-actions" slot-scope="props" :props="props"
            style="width:5px"
      >
        <q-btn
          dense round
          icon="delete"
          color="negative"
          size="xs"
          @click.exact="deleteProvider(props.row)"
          @click.shift.exact="doDeleteProvider(props.row)"
        >
          <q-tooltip>Delete provider</q-tooltip>
        </q-btn>
      </q-td>

    </q-table>
  </q-page>
</template>

<script>
  import allProvidersListGql from '../graphql/providers.gql'
  import providerDeleteGql from '../graphql/providerDelete.gql'

  import ProviderNewButton from 'components/provider-new-button'

  const debug = false

  export default {
    components: {
      ProviderNewButton
    },

    data() {
      return {
        allProvidersList: [],
        columns: [
          {
            field: 'providerId',
            name: 'providerId',
            label: 'ID',
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
            field: 'httpEndpoint',
            name: 'httpEndpoint',
            label: 'Endpoint',
            align: 'left',
            sortable: true
          },
          {
            field: 'apiType',
            name: 'apiType',
            label: 'API Type',
            align: 'left',
            sortable: true
          },
          {
            field: 'actions',
            name: 'actions',
            label: 'Actions',
            align: 'right'
          }
        ],
        rowsPerPage: [0],
        pagination: {
          rowsPerPage: 0
        },
      }
    },

    apollo: {
      allProvidersList: allProvidersListGql,
    },

    methods: {
      setBreadcrumbs() {
        this.$store.commit('utl/setBreadcrumbs', {
          elements: [],
          refresh: this.refreshProviders
        })
      },

      refreshProviders() {
        if (this.$apollo.queries.allProvidersList) {
          this.$apollo.queries.allProvidersList.refetch()
        }
      },

      providerCreated(provider) {
        if (debug) console.debug('providerCreated provider=', provider)
        this.refreshProviders()
      },

      deleteProvider(row) {
        this.$q.dialog({
          title: 'Confirm',
          message: `Are you sure you want to delete provider '${row.providerId}'` +
          ' and all associated entities?',
          color: 'negative',
          ok: `Yes, delete '${row.providerId}'`,
          cancel: true,
          focus: 'cancel',
        }).onOk(() => this.doDeleteProvider(row))
      },

      doDeleteProvider(row) {
        const mutation = providerDeleteGql
        const variables = {
          input: {
            id: row.id
          }
        }
        this.$apollo.mutate({mutation, variables})
          .then((data) => {
            if (debug) console.debug('deleteProvider: mutation data=', data)
            this.refreshProviders()
            this.$q.notify(`${row.providerId} deleted.`)
          })
          .catch((error) => {
            console.error('deleteProvider: mutation error=', error)
          })
      },
    },

    watch: {
      params: {
        handler(val) {
          console.warn('WATCH params=', val)
          this.setBreadcrumbs()
          this.refreshProviders()
        },
        deep: true,
        immediate: true,
      },
    },
  }
</script>
