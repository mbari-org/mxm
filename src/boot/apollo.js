import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'
import { graphqlUri } from '../statics/config.json'

export default ({ app, Vue }) => {
  const httpLink = new HttpLink({
    uri: graphqlUri,
  })

  // Create the apollo client
  const apolloClient = new ApolloClient({
    // TODO revisit the cache/fetch settings.
    // For now, it seems taht we need 'no-cache' in general
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
      },
      query: {
        fetchPolicy: 'no-cache',
      },
    },
    link: httpLink,
    cache: new InMemoryCache(),
    connectToDevTools: true,
  })

  // Install the vue plugin
  Vue.use(VueApollo)

  // Create apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
  })

  // Set apollo provider instance on app
  app.apolloProvider = apolloProvider // https://github.com/vuejs/vue-apollo/issues/408#issuecomment-426995379
}
