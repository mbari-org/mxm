// MXM plugin to intercept mutations involving MXM providers.
// Status: very preliminary.

import { makeWrapResolversPlugin } from 'graphile-utils'

export default makeWrapResolversPlugin({
  Mutation: {
    createProvider: createProviderResolverWrapper(),
    updateProvider: updateProviderResolverWrapper(),
  }
})

function createProviderResolverWrapper() {
  return async (resolve, source, args, context, resolveInfo) => {
    // You can do something before the resolver executes
    console.log('entering createProviderResolverWrapper')
    console.log('args=', args);

    const result = await resolve()

    console.log('exiting createProviderResolverWrapper')
    console.log('result=', result)

    return result
  }
}

function updateProviderResolverWrapper() {
  return async (resolve, source, args, context, resolveInfo) => {
    console.log('entering updateProviderResolverWrapper')
    console.log('args=', args);

    const result = await resolve()

    console.log('exiting updateProviderResolverWrapper')
    console.log('result=', result)

    return result
  }
}

/*
Output looks like:

    entering createProviderResolverWrapper
    args= {
      input: {
        provider: {
          providerId: 'AAATethysDash',
          httpEndpoint: 'http://tethyssim.shore.mbari.org:8080/TethysDash/api/mxm',
          apiType: 'graphql',
          description: 'TethysDash/LRAUV System'
        }
      }
    }
    exiting createProviderResolverWrapper
    result= {
      clientMutationId: undefined,
      data: {
        '@provider': {
          providerId: 'AAATethysDash',
          httpEndpoint: 'http://tethyssim.shore.mbari.org:8080/TethysDash/api/mxm',
          apiType: 'graphql',
          description: 'TethysDash/LRAUV System',
          canValidate: false,
          usesUnits: false,
          usesSched: false,
          descriptionFormat: null
        }
      }
    }
 */
