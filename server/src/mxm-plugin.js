// MXM plugin to intercept mutations involving MXM providers.
// Status: Preliminary.

import {
  makeWrapResolversPlugin,
} from 'graphile-utils'

import createProviderManager from './createProviderManager'

const plugin = makeWrapResolversPlugin({
  Mutation: {
    createProvider: createProviderResolverWrapper(),
    updateProvider: updateProviderResolverWrapper(),
    updateMissionTpl: updateMissionTplResolverWrapper(),
    updateMission: updateMissionResolverWrapper(),
  },
})

export default plugin

function createProviderResolverWrapper () {
  return async (resolve, source, args, context, resolveInfo) => {
    // You can do something before the resolver executes
    console.log('entering createProviderResolverWrapper')
    console.log('args=', args)

    const providerManager = createProviderManager(context)
    const providerId = args.input.provider.providerId
    const { httpEndpoint, apiType } = args.input.provider
    providerManager.setMxmProviderClient(providerId, httpEndpoint, apiType)

    await providerManager.preInsertProvider(args.input.provider)
    const result = await resolve()

    // Note: we could omit `await` to more quickly return to the client:
    await providerManager.postInsertProvider(args.input.provider)
    // TODO decide on final mechanism, perhaps using a worker.
    // But this is not critical as we are currently implementing a more
    // on-demand loading/update of the mission templates.

    console.log('exiting createProviderResolverWrapper')
    // console.log('result=', result)

    return result
  }
}

function updateProviderResolverWrapper () {
  return async (resolve, source, args, context, resolveInfo) => {
    console.log('entering updateProviderResolverWrapper')
    console.log('args=', args);

    const result = await resolve()

    console.log('exiting updateProviderResolverWrapper')
    console.log('result=', result)

    return result
  }
}

function updateMissionTplResolverWrapper () {
  return async (resolve, source, args, context, resolveInfo) => {
    console.log('entering updateMissionTplResolverWrapper')
    console.log('args=', args)

    // args= {
    //   input: {
    //     id: 'WyJtaXNzaW9uX3RwbHMiLCJUZXRoeXNEYXNoMyIsIkRlZmF1bHQiXQ==',
    //   }
    // }

    const providerManager = createProviderManager(context)

    await providerManager.preUpdateMissionTpl(args.input)
    const result = await resolve()

    console.log('exiting updateMissionTplResolverWrapper')
    console.log('result=', result)

    return result
  }
}

function updateMissionResolverWrapper () {
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
