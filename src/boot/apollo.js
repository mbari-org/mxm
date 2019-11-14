import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

export default ({ app, Vue }) => {

  // GraphQL endpoint:
  const graphqlUri =
    // '/mxm-graphql'                             // for regular dockerized release with proxy-passes as appropriate
    // 'http://localhost:5000/mxm-graphql'        // for local devel against local dockerized postgraphile
    'http://tsauv.shore.mbari.org/mxm-graphql' // for local devel against MXM running on TSAUV

  // this to facilitate showing the graphqlUri in the UI
  Vue.prototype.$mxm = {
    graphqlUri,
    learnMoreUrl: 'https://docs.google.com/document/d/1Fx8C92x4uB9dCx9SH7cpCscn8LqSZywyYm47y8TKDJY/edit?usp=sharing',
  }

  const httpLink = new HttpLink({
    uri: graphqlUri,
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
