// MXM plugin to intercept mutations involving MXM providers.
// Status: very preliminary.

import { makeWrapResolversPlugin } from 'graphile-utils'

import createProviderManager from './createProviderManager'

export default makeWrapResolversPlugin({
  Mutation: {
    createProvider: createProviderResolverWrapper(),
    updateProvider: updateProviderResolverWrapper(),
    updateMission: updateMissionResolverWrapper(),
  }
})

function createProviderResolverWrapper() {
  return async (resolve, source, args, context, resolveInfo) => {
    // You can do something before the resolver executes
    console.log('entering createProviderResolverWrapper')
    console.log('args=', args)

    const providerManager = createProviderManager(context)
    const {httpEndpoint, apiType} = args.input.provider
    providerManager.setMxmProviderClient(httpEndpoint, apiType)

    await providerManager.preInsertProvider(args.input.provider)
    const result = await resolve()
    await providerManager.postInsertProvider(args.input.provider)

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

function updateMissionResolverWrapper() {
  return async (resolve, source, args, context, resolveInfo) => {
    console.log('entering updateMissionResolverWrapper')
    console.log('args=', args);

    const providerManager = createProviderManager(context)

    await providerManager.preUpdateMission(args.input)
    const result = await resolve()

    console.log('exiting updateMissionResolverWrapper')
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
