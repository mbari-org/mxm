import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

export default async ({ store, app, Vue }) => {
  return new Promise((resolve, reject) => {
    store.dispatch('config/loadConfig')
      .then(config => {
        resolve(initApollo(config))
      })
      .catch(e => reject(e))

    function initApollo({graphqlUri}) {
      console.log('initApollo: graphqlUri=', graphqlUri)
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
  })
}
