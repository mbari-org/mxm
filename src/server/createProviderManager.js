export default createProviderManager

import createMxmProviderClient from './provider_client/mxmProviderClient'
import {
  Gql,
  getMissionTplByID,
  deleteMissionTplByID,
  getMissionByID,
  performQuery,
} from './gql'
import {
  cleanPath,
} from './utl.js'

import orderBy from "lodash/orderBy"
import reduce from "lodash/reduce"
import isEmpty from "lodash/isEmpty"

const debug = false

function createProviderManager(context) {
  let mxmProviderClient = null

  return {
    setMxmProviderClient,
    preInsertProvider,
    postInsertProvider,

    preUpdateMissionTpl,

    preUpdateMission,
  }

  function setMxmProviderClient(providerId, httpEndpoint, apiType) {
    console.assert(providerId && httpEndpoint && apiType)
    mxmProviderClient = createMxmProviderClient({providerId, httpEndpoint, apiType})
  }

  async function preInsertProvider(provider) {
    if (!mxmProviderClient.isSupportedInterface()) {
      console.warn('preInsertProvider: Not supported interface to provider')
      return
    }

    try {
      const info = await mxmProviderClient.getGeneralInfo()
      if (debug) console.log('GOT general info=', info)

      if (info.providerDescription)  {
        provider.description = info.providerDescription
      }

      const capabilities = info.capabilities || {}

      provider.usesSched = capabilities.usesSched || false
      provider.canValidate = capabilities.canValidate || false
      provider.usesUnits = capabilities.usesUnits || false
      provider.canReportMissionStatus = capabilities.canReportMissionStatus || false
      provider.descriptionFormat = capabilities.descriptionFormat
    }
    catch(error) {
      console.error('getGeneralInfo: error=', error)
    }
  }

  async function postInsertProvider(provider) {
    if (!mxmProviderClient.isSupportedInterface()) {
      console.warn('postInsertProvider: Not supported interface to provider')
      return
    }

    // Asset Classes
    const assetClasses = await mxmProviderClient.getAssetClasses()
    if (debug) console.log('GOT getAssetClasses=', assetClasses)
    await createAssetClasses(assetClasses)

    // Units:
    if (provider.usesUnits) {
      await getAndCreateUnits()
    }

    // MissionTpls:
    await getAndCreateMissionTplsForDirectory('/')

    async function createAssetClasses(assetClasses) {
      return await runInSequence(
          assetClasses.map(assetClass => () => createAssetClass(assetClass))
      )
    }

    async function createAssetClass(assetClass) {
      if (debug) console.log('createAssetClass ', assetClass)

      const query = Gql.assetClassInsert()

      const variables = {
        providerId: provider.providerId,
        className: assetClass.assetClassName,
        description: assetClass.description || null
      }
      const operationName = 'createAssetClass'
      const result = await performQuery(query, variables, operationName, context)
      if (debug) console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
      const assets = assetClass.assets || []
      await createAssets(assetClass, assets)
    }

    async function createAssets(assetClass, assets) {
      return await runInSequence(
          assets.map(asset => () => createAsset(assetClass, asset))
      )
    }

    async function createAsset(assetClass, asset) {
      if (debug) console.log('createAsset ', asset)

      const query = Gql.assetInsert()

      const variables = {
        providerId: provider.providerId,
        className: assetClass.assetClassName,
        assetId: asset.assetId,
        description: asset.description || null
      }
      const operationName = 'createAsset'
      const result = await performQuery(query, variables, operationName, context)
      if (debug) console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
    }

    async function getAndCreateUnits() {
      const units = await mxmProviderClient.getUnits()
      await createUnits(units)
    }

    async function createUnits(units) {
      const sortedUnits = orderBy(units, u => u.baseUnit ? 1 : 0)
      return await runInSequence(
          sortedUnits.map(unit => () => createUnit(unit))
      )
    }

    async function createUnit(unit) {
      const query = Gql.unitInsert()

      const variables = {
        providerId: provider.providerId,
        unitName: unit.name,
      }
      if (unit.abbreviation) {
        variables.abbreviation = unit.abbreviation
      }
      if (unit.baseUnit) {
        variables.baseUnit = unit.baseUnit
      }
      const operationName = 'createUnit'
      const result = await performQuery(query, variables, operationName, context)
      if (debug) console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
    }
  }

  // capture entries at the given directory:
  async function getAndCreateMissionTplsForDirectory(directory) {
    console.log(`getAndCreateMissionTplsForDirectory: directory=${directory}`)
    console.assert(directory.endsWith('/'))

    // create a MissionTpl entry for the directory itself:
    const retrievedAt = new Date().toISOString()
    await getAndCreateMissionTpl(directory, retrievedAt)

    const missionTplListing = await mxmProviderClient.listMissionTemplates(
      directory.replace(/^\/+/, '')   // TODO consistent path name handling
    )
    console.log(`missionTplListing: directory=${directory} =>`, missionTplListing)

    // and for each of the listing:
    const filenames = missionTplListing.filenames || []
    return await runInSequence(
        filenames.map(filename => () => getAndCreateMissionTpl(`${directory}/${filename}`))
    )
  }

  async function getAndCreateMissionTpl(missionTplId, retrievedAt = null) {
    missionTplId = cleanPath(missionTplId)
    const isDirectory = missionTplId.endsWith('/')

    let missionTpl;
    if (isDirectory) {
      missionTpl = { missionTplId }
    }
    else {
      missionTpl = await mxmProviderClient.getMissionTemplate(missionTplId)
      //console.log('retrieved from provider: missionTpl.parameters=', missionTpl.parameters)

      // TODO this is a trick while provider reports id with leading slash:
      missionTpl.missionTplId = cleanPath(missionTpl.missionTplId)
    }

    await createMissionTpl(missionTpl, retrievedAt)
  }

  async function createMissionTpl(missionTpl, retrievedAt = null) {
    const providerId = mxmProviderClient.providerId

    const query = Gql.missionTplInsert()

    const variables = {
      providerId,
      missionTplId: missionTpl.missionTplId,
      description: missionTpl.description,
      retrievedAt,
    }
    const operationName = 'createMissionTpl'
    const result = await performQuery(query, variables, operationName, context)
    if (result.errors) {
      result.errors.forEach(error => {
        console.log('ERROR=', error)
      })
      return
    }
    /*if (debug)*/ console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)

    if (!missionTpl.missionTplId.endsWith('/')) {
      const assetClassNames = missionTpl.assetClassNames || []
      await createAssociatedAssetClasses(missionTpl, assetClassNames)

      const parameters = missionTpl.parameters || []
      await createParameters(missionTpl, parameters)
    }
  }

  async function createAssociatedAssetClasses(missionTpl, assetClassNames) {
    return await runInSequence(
        assetClassNames.map(assetClassName => () => createAssociatedAssetClass(missionTpl, assetClassName))
    )
  }

  async function createAssociatedAssetClass(missionTpl, assetClassName) {
    const providerId = mxmProviderClient.providerId

    const query = Gql.missionTplAssetClassInsert()

    const variables = {
      providerId,
      missionTplId: missionTpl.missionTplId,
      assetClassName
    }
    const operationName = 'createMissionTplAssetClass'
    const result = await performQuery(query, variables, operationName, context)
    if (debug) console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
  }

  async function createParameters(missionTpl, parameters) {
    await runInSequence(
        parameters.map(parameter => () => createParameter(missionTpl, parameter))
    )
  }

  async function createParameter(missionTpl, parameter) {
    // console.log(`<<< createParameter: parameter.paramName=${parameter.paramName}`)
    const providerId = mxmProviderClient.providerId

    const query = Gql.parameterInsert()

    const variables = {
      providerId,
      missionTplId: missionTpl.missionTplId,
      paramName: parameter.paramName,
      type: parameter.type,
      required: parameter.required,
      description: parameter.description,
    }
    if (parameter.defaultValue) {
      variables.defaultValue = '' + parameter.defaultValue
    }
    if (parameter.defaultUnits) {
      variables.defaultUnits = parameter.defaultUnits
    }
    if (parameter.valueCanReference) {
      variables.valueCanReference = parameter.valueCanReference
    }
    const operationName = 'createParameter'
    const result = await performQuery(query, variables, operationName, context)
    if (debug) console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
    // console.log(`>>> createParameter: parameter.paramName=${parameter.paramName}`)
  }


  /**
   * Performs a reload of the mission template from the provider.
   */
  async function preUpdateMissionTpl(input) {
    const {id, missionTplPatch} = input
    console.assert(isEmpty(missionTplPatch))
    if (debug) console.log(`preUpdateMissionTpl: id=${id}`)

    // get the current state of the missionTpl:
    const missionTpl = await getMissionTplByID(context, id)
    console.log('missionTpl=', missionTpl)
    const missionTplId = missionTpl.missionTplId

    const {providerId, httpEndpoint, apiType} = missionTpl.providerByProviderId
    setMxmProviderClient(providerId, httpEndpoint, apiType)

    // delete it:
    await deleteMissionTplByID(context, id)
    console.log(`missionTpl DELETED  missionTplId=${missionTplId}  id=${id}`)

    // reload and recreate:

    if (missionTplId.endsWith('/')) {
      console.log('RELOADING/RECREATING DIRECTORY missionTplId=', missionTplId)
      // create directory entry and the direct children:
      await getAndCreateMissionTplsForDirectory(missionTplId)
    }
    else {
      console.log('RELOADING/RECREATING template missionTplId=', missionTplId)
      // just the template:
      await getAndCreateMissionTpl(missionTplId)
    }
  }

  async function preUpdateMission(input) {
    const {id, missionPatch} = input
    /*if (debug)*/ console.log(`preUpdateMission: id=${id} missionPatch=`, missionPatch)

    // get the current state of the mission:
    const mission = await getMissionByID(context, id)
    // console.log(`MISSION=`, mission)
    const providerId = mission.providerId

    // set up provider client:
    const provider = mission.missionTplByProviderIdAndMissionTplId.providerByProviderId
    const {httpEndpoint, apiType} = provider
    setMxmProviderClient(providerId, httpEndpoint, apiType)
    if (!mxmProviderClient.isSupportedInterface()) {
      console.warn('preUpdateMission: Not supported interface to provider')
      // let the operation continue.
      return
    }

    console.log('preUpdateMission: provider=', provider)

    // depending on current missionStatus:
    switch (mission.missionStatus) {
      case 'DRAFT': {
        // is mission being submitted?
        if (missionPatch.missionStatus === 'submitted') {
          await submitMission(provider, mission)
          break
        }
        else if (!missionPatch.missionStatus || missionPatch.missionStatus === 'draft') {
          // OK, no requested change in status; let mutation proceed.
          break
        }
        else {
          throw new Error(`Unexpected missionPatch.missionStatus=${missionPatch.missionStatus} in DRAFT status`)
        }
      }

      default:
        if (isEmpty(missionPatch)) {
          // This is a request for refreshing the mission status.
          if (provider.canReportMissionStatus) {
            const status = await retrieveMissionStatus(mission)
            if (status) {
              missionPatch.missionStatus = status
            }
          }
          else {
            console.debug(`provider '${providerId}' does not support reporting mission status`)
          }
        }
        else {
          throw new Error(`Invalid modification request from client as misssion is in status: ${mission.missionStatus}`)
        }
    }
  }

  async function submitMission(provider, mission) {
    // TODO ....
    let args = mission.argumentsByProviderIdAndMissionTplIdAndMissionIdList

    args = reduce(args, (obj, {paramName, paramValue, type, paramUnits}) => {
      obj[paramName] = {
        value: convertValue(paramValue, type),
        units: paramUnits,
      }
      return obj
    }, {})

    const data = {
      missionTplId:   mission.missionTplId,
      missionId:      mission.missionId,
      assetId:        mission.assetId,
      description:    mission.description,
      arguments: args,
    }

    if (provider.usesSched) {
      data.schedType = mission.schedType
      data.schedDate = data.schedType === 'DATE' ? mission.schedDate : null
    }

    if (debug) console.debug('submitMission: payload=', data)

    try {
      const res = await mxmProviderClient.postMission(data)
      if (!res.status) {
        throw new Error('Provider reported no status for mission submission')
      }
    }
    catch(error) {
      console.error('submitMission: postMission throw error=', error)
      throw error
    }
  }

  async function retrieveMissionStatus(mission) {
    const res = await mxmProviderClient.getMissionById(mission.missionId)
    console.debug('mxmProviderClient.getMissionById: res=', res)
    if (res.status) {
      return res.status
    }
    else {
      console.error(`provider '${mission.providerId}' reported no status for missionId=${mission.missionId}`)
    }
  }
}

/**
 * Runs the given promises in sequence.
 * @param promises  List of promises or functions that generate the promise.
 * @return list of results.
 */
function runInSequence(promises) {
  return promises.reduce(
      (acum, promise) => acum.then(results => {
        if (typeof promise === 'function') {
          promise = promise()
        }
        return promise.then(result => [...results, result])
      }
    ),
    Promise.resolve([])
  )
}

// TODO convertValue still pretty ad hoc
function convertValue(value, type) {
  switch (type) {
    case 'float': return parseFloat(value)
    case 'int': return parseInt(value)
    case 'boolean': return value && value.toLowerCase() === 'true'
    case 'string': return value

    // https://tools.ietf.org/html/rfc7946#section-3.1.1
    case 'Point': return JSON.parse(value)
    case 'MultiPoint': return JSON.parse(value)
    case 'LineString': return JSON.parse(value)
    case 'MultiLineString': return JSON.parse(value)
    case 'Polygon': return JSON.parse(value)
    case 'MultiPolygon': return JSON.parse(value)
    case 'GeometryCollection': return JSON.parse(value)

    // https://tools.ietf.org/html/rfc7946#section-3.2
    case 'Feature': return JSON.parse(value)
    case 'FeatureCollection': return JSON.parse(value)

    // https://tools.ietf.org/html/rfc7946#section-3
    case 'GeoJSON': return JSON.parse(value)

    default: return value
  }
}
