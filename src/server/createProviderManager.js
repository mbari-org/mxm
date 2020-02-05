import map from "lodash/map"

export default createProviderManager

import createMxmProviderClient from './provider_client/mxmProviderClient'
import performQuery from './gql'
import fs from 'fs'
import orderBy from "lodash/orderBy"
import get from "lodash/get"
import reduce from "lodash/reduce"

const debug = true

function createProviderManager(context) {
  let mxmProviderClient = null

  return {
    setMxmProviderClient,
    preInsertProvider,
    postInsertProvider,

    preUpdateMission,
  }

  function setMxmProviderClient(httpEndpoint, apiType) {
    mxmProviderClient = createMxmProviderClient({httpEndpoint, apiType})
  }

  async function preInsertProvider(provider) {
    if (!mxmProviderClient.isSupportedInterface()) {
      console.warn('preInsertProvider: Not supported interface to provider')
      return
    }

    try {
      const capabilities = await mxmProviderClient.getCapabilities()
      console.log('GOT capabilities=', capabilities)

      provider.usesSched = capabilities.usesSched || false
      provider.canValidate = capabilities.canValidate || false
      provider.usesUnits = capabilities.usesUnits || false
      provider.descriptionFormat = capabilities.descriptionFormat
    }
    catch(error) {
      console.error('getCapabilities: error=', error)
    }
  }

  async function postInsertProvider(provider) {
    if (!mxmProviderClient.isSupportedInterface()) {
      console.warn('postInsertProvider: Not supported interface to provider')
      return
    }

    try {
      const assetClasses = await mxmProviderClient.getAssetClasses()
      console.log('GOT getAssetClasses=', assetClasses)
      await createAssetClasses(assetClasses)
    }
    catch(error) {
      console.error('getAssetClasses: error=', error)
    }

    try {
      if (provider.usesUnits) {
        await getAndCreateUnits()
      }
      else {
        await getAndCreateMissionTpls()
      }
    }
    catch(error) {
      console.error('getAssetClasses: error=', error)
    }

    async function createAssetClasses(assetClasses) {
      return await runInSequence(assetClasses.map(async assetClass => await createAssetClass(assetClass)))
    }

    async function createAssetClass(assetClass) {
      console.log('createAssetClass ', assetClass)

      const query = fs.readFileSync('src/graphql/assetClassInsert.gql', {encoding: 'utf8'})

      const variables = {
        providerId: provider.providerId,
        className: assetClass.assetClassName,
        description: assetClass.description || null
      }
      const operationName = 'createAssetClass'
      const result = await performQuery(query, variables, operationName, context)
      console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
      const assets = assetClass.assets || []
      await createAssets(assetClass, assets)
    }

    async function createAssets(assetClass, assets) {
      return await runInSequence(assets.map(async asset => await createAsset(assetClass, asset)))
    }

    async function createAsset(assetClass, asset) {
      console.log('createAsset ', asset)

      const query = fs.readFileSync('src/graphql/assetInsert.gql', {encoding: 'utf8'})

      const variables = {
        providerId: provider.providerId,
        className: assetClass.assetClassName,
        assetId: asset.assetId,
        description: asset.description || null
      }
      const operationName = 'createAsset'
      const result = await performQuery(query, variables, operationName, context)
      console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
    }

    async function getAndCreateUnits() {
      const units = await mxmProviderClient.getUnits()
      await createUnits(units)
      await getAndCreateMissionTpls()
    }

    async function createUnits(units) {
      const sortedUnits = orderBy(units, u => u.baseUnit ? 1 : 0)
      await runInSequence(sortedUnits.map(async unit => await createUnit(unit)))
    }

    async function createUnit(unit) {
      const query = fs.readFileSync('src/graphql/unitInsert.gql', {encoding: 'utf8'})

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
      console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
    }

    async function getAndCreateMissionTpls() {
      const missionTpls = await mxmProviderClient.getMissionTpls()
      await createMissionTpls(missionTpls)
    }

    async function createMissionTpls(missionTpls) {
      await runInSequence(missionTpls.map(async missionTpl => await createMissionTpl(missionTpl)))
    }

    async function createMissionTpl(missionTpl) {
      const query = fs.readFileSync('src/graphql/missionTplInsert.gql', {encoding: 'utf8'})

      const variables = {
        providerId: provider.providerId,
        missionTplId: missionTpl.missionTplId,
        description: missionTpl.description,
      }
      const operationName = 'createMissionTpl'
      const result = await performQuery(query, variables, operationName, context)
      console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)

      const assetClassNames = missionTpl.assetClassNames || []
      await createAssociatedAssetClasses(missionTpl, assetClassNames)

      const parameters = missionTpl.parameters || []
      await createParameters(missionTpl, parameters)
    }

    async function createAssociatedAssetClasses(missionTpl, assetClassNames) {
      await runInSequence(assetClassNames.map(async assetClassName => await createAssociatedAssetClass(missionTpl, assetClassName)))
    }

    async function createAssociatedAssetClass(missionTpl, assetClassName) {
      const query = fs.readFileSync('src/graphql/missionTplAssetClassInsert.gql', {encoding: 'utf8'})

      const variables = {
        providerId: provider.providerId,
        missionTplId: missionTpl.missionTplId,
        assetClassName
      }
      const operationName = 'createMissionTplAssetClass'
      const result = await performQuery(query, variables, operationName, context)
      console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
    }

    async function createParameters(missionTpl, parameters) {
      await runInSequence(parameters.map(async parameter => await createParameter(missionTpl, parameter)))
    }

    async function createParameter(missionTpl, parameter) {
      const query = fs.readFileSync('src/graphql/parameterInsert.gql', {encoding: 'utf8'})

      const variables = {
        providerId: provider.providerId,
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
      console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
    }
  }

  async function preUpdateMission(input) {
    const {id, missionPatch} = input
    console.log(`preUpdateMission: id=${id} missionPatch=`, missionPatch)

    if (missionPatch.missionStatus !== 'submitted') {
      return
    }

    // mission is being submitted.

    // get the current state of the mission:
    const query = fs.readFileSync('src/graphql/missionByID.gql', {encoding: 'utf8'})
    const variables = { id }
    const operationName = 'missionByID'
    const result = await performQuery(query, variables, operationName, context)
    console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
    const mission = result.data.mission

    // set up provider client:
    const provider = mission.missionTplByProviderIdAndMissionTplId.providerByProviderId
    const {httpEndpoint, apiType} = provider
    setMxmProviderClient(httpEndpoint, apiType)
    if (!mxmProviderClient.isSupportedInterface()) {
      console.warn('preUpdateMission: Not supported interface to provider')
      // let the operation continue.
      return
    }

    if (mission.missionStatus !== 'DRAFT') {
      throw new Error(`Expecting current missionStatus to be DRAFT, but got: ${missionStatus}`)
    }

    await submitMission(provider, mission)
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

    console.debug('submitMission: payload=', data)

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
}

function runInSequence(promises) {
  return promises.reduce((acum, promise) => acum.then(results =>
      promise.then(result => [...results, result])
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
