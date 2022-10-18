<script setup lang="ts">
import { computed } from 'vue'

import ProviderNewButton from './ProviderNewButton.vue'
import MxmMarkdownView from 'components/utl/markdown/MxmMarkdownView.vue'
import { useMutation, useQuery, useSubscription } from '@vue/apollo-composable'
import { useUtlStore } from 'stores/utl'
import {
  ALL_PROVIDERS,
  DELETE_PROVIDER,
  PROVIDER_CREATED,
  PROVIDER_DELETED,
  PROVIDER_UPDATED,
} from './queries'

import { useQuasar } from 'quasar'

const debug = window.location.search.match(/.*debug=(-|.*\bprovider\b).*/)

const $q = useQuasar()

const { mutate: deleteProvider } = useMutation(DELETE_PROVIDER)

const {
  result,
  subscribeToMore,
  loading,
  refetch: refetchProviders,
} = useQuery(ALL_PROVIDERS)

const allProviders = computed(() => result.value?.allProviders ?? [])

// for externally performed creation
subscribeToMore(() => ({
  document: PROVIDER_CREATED,
  updateQuery: (previousResult, { subscriptionData }) => {
    if (debug)
      console.debug(
        'previousResult=',
        previousResult,
        'subscriptionData=',
        subscriptionData
      )
    return Object.assign({}, previousResult, {
      allProviders: [
        ...previousResult.allProviders,
        subscriptionData.data.providerCreated,
      ],
    })
  },
}))

// for externally performed update
subscribeToMore(() => ({
  document: PROVIDER_UPDATED,
  updateQuery: (previousResult, { subscriptionData }) => {
    console.debug(
      'providerUpdated: previousResult=',
      previousResult,
      'subscriptionData=',
      subscriptionData
    )
    const providerUpdated = subscriptionData.data.providerUpdated
    return Object.assign({}, previousResult, {
      allProviders: previousResult.allProviders.map(p =>
        providerUpdated.providerId === p.providerId
          ? {
              ...p,
              providerUpdated,
            }
          : p
      ),
    })
  },
}))

// for externally performed deletion
subscribeToMore(() => ({
  document: PROVIDER_DELETED,
  updateQuery: (previousResult, { subscriptionData }) => {
    console.debug(
      'previousResult=',
      previousResult,
      'subscriptionData=',
      subscriptionData
    )
    const providerId = subscriptionData.data.providerDeleted.providerId
    return Object.assign({}, previousResult, {
      allProviders: previousResult.allProviders.filter(
        r => r.providerId !== providerId
      ),
    })
  },
}))

const { result: providerCreatedSubscription } =
  useSubscription(PROVIDER_CREATED)
const { result: providerUpdatedSubscription } =
  useSubscription(PROVIDER_UPDATED)
const { result: providerDeletedSubscription } =
  useSubscription(PROVIDER_DELETED)

useUtlStore().setRefreshFunction(refetchProviders, 'Refresh list of providers')

function providerCreated(provider) {
  /*if (debug)*/
  console.warn('providerCreated provider=', provider)
  // note: due to the subscribeToMore, this is not needed:
  // refetchProviders()
}

const tableConf = {
  columns: [
    {
      name: 'providerId',
      label: 'ID',
      field: 'providerId',
      align: 'left',
      sortable: true,
    },
    {
      name: 'description',
      field: 'description',
      label: 'Description',
      align: 'left',
      sortable: true,
    },
    {
      name: 'httpEndpoint',
      field: 'httpEndpoint',
      label: 'MXM Endpoint',
      align: 'left',
      sortable: true,
    },
    {
      name: 'apiType',
      field: 'apiType',
      label: 'API Type',
      align: 'left',
      sortable: true,
    },
    {
      name: 'actions',
      // field: 'actions',
      label: 'Actions',
      align: 'right',
    },
  ],
  rowsPerPage: [0],
  pagination: {
    rowsPerPage: 0,
  },
}

function confirmAndDeleteProvider(row) {
  $q.dialog({
    title: 'Confirm',
    message:
      `Are you sure you want to delete provider '${row.providerId}'` +
      ' and all associated entities?',
    color: 'negative',
    dark: $q.dark.isActive,
    ok: `Yes, delete '${row.providerId}'`,
    cancel: true,
    focus: 'cancel',
  }).onOk(() => doDeleteProvider(row.providerId))
}

async function doDeleteProvider(providerId: string) {
  const variables = { pl: { providerId } }
  const update = (cache, { data: { deleteProvider } }) => {
    console.debug('deleteProvider deleteProvider=', deleteProvider)
    let data = cache.readQuery({ query: ALL_PROVIDERS })
    console.debug('deleteProvider data=', data)
    data = {
      ...data,
      allProviders: data.allProviders.filter(
        r => r.providerId !== deleteProvider.providerId
      ),
    }
    cache.writeQuery({ query: ALL_PROVIDERS, data })
  }

  if (debug) console.debug('deleteProvider with variables=', variables)
  try {
    const data = await deleteProvider(variables, {
      update,
    })
    if (debug) console.debug('deleteProvider: mutation data=', data)
    $q.notify(`${providerId} deleted.`)
  } catch (error) {
    console.error('deleteProvider: mutation error=', error)
  }
}
</script>

<template>
  <q-page class="q-pa-sm">
    <div v-if="loading">Loading...</div>
    <q-table
      v-else
      :rows="allProviders"
      :columns="tableConf.columns"
      row-key="name"
      :rows-per-page-options="tableConf.rowsPerPage"
      :pagination="tableConf.pagination"
      separator="cell"
      no-data-label="No providers registered"
    >
      <template v-slot:top>
        <div class="full-width row justify-between">
          <div class="col-auto text-h5">
            Registered mission execution systems
            <span class="text-grey"> (aka Providers) </span>
          </div>

          <ProviderNewButton @providerCreated="providerCreated" />
        </div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td
            key="providerId"
            :props="props"
            style="width: 5px; vertical-align: top"
          >
            <router-link
              class="appLink"
              :to="utl.routeLoc(['p', props.row.providerId])"
            >
              {{ props.row.providerId }}
            </router-link>
          </q-td>

          <q-td key="description" :props="props">
            <MxmMarkdownView
              :text="props.row.description"
              hide-empty
              simple
              :start-markdown="props.row.descriptionFormat === 'markdown'"
            />
          </q-td>

          <q-td key="httpEndpoint" :props="props" style="vertical-align: top">
            {{ props.row.httpEndpoint }}
          </q-td>

          <q-td key="apiType" :props="props" style="vertical-align: top">
            {{ props.row.apiType }}
          </q-td>

          <q-td
            key="actions"
            :props="props"
            style="width: 5px; vertical-align: top"
          >
            <q-btn
              dense
              round
              icon="delete"
              color="negative"
              size="xs"
              @click.exact="confirmAndDeleteProvider(props.row)"
              @click.shift.exact="doDeleteProvider(props.row)"
            >
              <q-tooltip>Delete provider</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <div v-if="debug">
      <!--    <pre>allProviders={{ allProviders }}</pre>-->
      <pre>providerCreatedSubscription={{ providerCreatedSubscription }}</pre>
      <pre>providerUpdatedSubscription={{ providerUpdatedSubscription }}</pre>
      <pre>providerDeletedSubscription={{ providerDeletedSubscription }}</pre>
    </div>
  </q-page>
</template>
