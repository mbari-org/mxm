import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

export default ({ app, Vue }) => {

  // GraphQL enpoint:
  const uri =
    '/pxs-graphql'                             // for regular dockerized release with proxy-passes as appropriate
    // 'http://localhost:5000/pxs-graphql'        // for local devel against local dockerized postgraphile
    // 'http://tsauv.shore.mbari.org/pxs-graphql' // for local devel against PXS running on TSAUV

  // this to facilitate showing the uri in the UI
  Vue.prototype.pxsGraphqlUri = uri

  const httpLink = new HttpLink({
    uri
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
