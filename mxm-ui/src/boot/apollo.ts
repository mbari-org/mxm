import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  split,
} from '@apollo/client/core'
import { provideApolloClient } from '@vue/apollo-composable'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { loadConfig } from 'boot/mxmConfig'
import { boot } from 'quasar/wrappers'
import { getMainDefinition } from '@apollo/client/utilities'

const debug = window.location.search.match(/.*debug=.*\bapollo\b.*/)

export default boot(async () => {
  const config = await loadConfig

  const httpLink = createHttpLink({
    uri: config.graphqlUri,
  })

  const wsLink = new GraphQLWsLink(
    createClient({
      url: config.websocketUrl,

      // preliminary settings to keep the connection alive,
      // for now mainly to re-enable to connection when restarting
      // the mxm server while in development mode:
      shouldRetry: () => true,
      keepAlive: 10_000,
    })
  )

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink,
    httpLink
  )

  const cache = new InMemoryCache({
    // TODO NOTE:
    //  - keyFields: ['providerId'] needed from Providers (listing) page to handle updates from subscription.
    //  - but problematic in the particular Provider page if the query does not contain providerId

    typePolicies: {
      Provider: {
        keyFields: ['providerId'],
      },

      MissionTemplate: {
        keyFields: ['providerId', 'missionTplId'],
      },

      AssetClass: {
        keyFields: ['className'],
      },

      Asset: {
        keyFields: ['assetId'],
      },

      Parameter: {
        keyFields: ['providerId', 'missionTplId', 'paramName'],
      },

      Mission: {
        keyFields: ['providerId', 'missionTplId', 'missionId'],
        fields: {
          missionStatusUpdates: {
            merge(existing = [], incoming: any[]) {
              // note: the list is always fully provided, so no need to merge
              return [...incoming]
            },
          },
        },
      },

      Unit: {
        keyFields: ['unitName'],
      },

      Query: {
        fields: {
          allProviders: {
            merge(existing, incoming: any[]) {
              if (debug)
                console.debug(
                  'allProviders merge: existing=',
                  existing,
                  'incoming=',
                  incoming
                )
              // in this case the `incoming` is the whole new list of providers
              return incoming
            },
          },
        },
      },
    },
  })

  const apolloClient = new ApolloClient({
    link,
    cache,
  })

  provideApolloClient(apolloClient)
})
