import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

export default ({ app, Vue }) => {
  const httpLink = new HttpLink({
    uri: 'http://localhost:5000/graphql', // PostGraphile
//  uri: 'http://localhost:8090/v1alpha1/graphql', // Hasura
  })

  // Create the apollo client
  const apolloClient = new ApolloClient({
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
  app.provide = apolloProvider.provide()
}
