export default createProviderManager

import createMxmProviderClient from './provider_client/mxmProviderClient'
import {
  Gql,
  getMissionTplByID,
  deleteMissionTplByID,
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
    queryMissionStatus,
  }

  function setMxmProviderClient(providerId, httpEndpoint, apiType) {
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
    try {
      const assetClasses = await mxmProviderClient.getAssetClasses()
      if (debug) console.log('GOT getAssetClasses=', assetClasses)
      await createAssetClasses(assetClasses)
    }
    catch(error) {
      console.error('getAssetClasses: error=', error)
    }

    // Units:
    if (provider.usesUnits) {
      try {
        await getAndCreateUnits()
      }
      catch(error) {
        console.error('getAndCreateUnits: error=', error)
      }
    }

    // MissionTpls:
    try {
      await getAndCreateMissionTplsForDirectory('/')
    }
    catch(error) {
      console.error('getAssetClasses: error=', error)
    }

    async function createAssetClasses(assetClasses) {
      return await runInSequence(assetClasses.map(async assetClass => await createAssetClass(assetClass)))
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
      return await runInSequence(assets.map(async asset => await createAsset(assetClass, asset)))
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
      await runInSequence(sortedUnits.map(async unit => await createUnit(unit)))
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
    await runInSequence(filenames.map(async filename => {
      await getAndCreateMissionTpl(`${directory}/${filename}`)
    }))
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

      // TODO this is a trick while provider reports id with leading slash:
      missionTpl.missionTplId = cleanPath(missionTpl.missionTplId)
    }

    await createMissionTpl(missionTpl, retrievedAt)
  }

  async function createMissionTpl(missionTpl, retrievedAt = null) {
    const providerId = mxmProviderClient.providerId

    const query = Gql.missionTplInsert()

    console.log(`createMissionTpl: missionTplId=`, missionTpl.missionTplId)

    const variables = {
      providerId,
      missionTplId: missionTpl.missionTplId,
      description: missionTpl.description,
      retrievedAt,
    }
    const operationName = 'createMissionTpl'
    const result = await performQuery(query, variables, operationName, context)
    if (debug) console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)

    if (!missionTpl.missionTplId.endsWith('/')) {
      const assetClassNames = missionTpl.assetClassNames || []
      await createAssociatedAssetClasses(missionTpl, assetClassNames)

      const parameters = missionTpl.parameters || []
      await createParameters(missionTpl, parameters)
    }
  }

  async function createAssociatedAssetClasses(missionTpl, assetClassNames) {
    await runInSequence(assetClassNames.map(async assetClassName => await createAssociatedAssetClass(missionTpl, assetClassName)))
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
    await runInSequence(parameters.map(async parameter => await createParameter(missionTpl, parameter)))
  }

  async function createParameter(missionTpl, parameter) {
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
    if (debug) console.log(`preUpdateMission: id=${id} missionPatch=`, missionPatch)

    if (missionPatch.missionStatus !== 'submitted') {
      return
    }

    // mission is being submitted.

    // get the current state of the mission:
    const query = Gql.missionByID()
    const variables = { id }
    const operationName = 'missionByID'
    const result = await performQuery(query, variables, operationName, context)
    if (debug) console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
    const mission = result.data.mission

    // set up provider client:
    const provider = mission.missionTplByProviderIdAndMissionTplId.providerByProviderId
    const {providerId, httpEndpoint, apiType} = provider
    setMxmProviderClient(providerId, httpEndpoint, apiType)
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

  async function queryMissionStatus(providerId, missionTplId, missionId) {

    // TODO

    console.log('queryMissionStatus:', providerId, missionTplId, missionId)


    // set up provider client:
    const provider = mission.missionTplByProviderIdAndMissionTplId.providerByProviderId
    const {httpEndpoint, apiType} = provider
    setMxmProviderClient(providerId, httpEndpoint, apiType)
    if (!mxmProviderClient.isSupportedInterface()) {
      console.warn('preUpdateMission: Not supported interface to provider')
      // let the operation continue.
      return
    }



    return

    this.mxmProviderClient.getMissionById(this.mission.missionId)
      .then(res => {
        console.debug('getMission: res=', res)
        if (!res.status) {
          this.$q.notify("Provider reported no status")
          return
        }
        const status = res.status
        this.$q.notify({
          message: `Status: ${status}`,
          timeout: 1000,
          color: 'info',
          position: 'top-left'
        })
        if (this.mission.missionStatus !== status) {
          this.updateMissionStatus(status)
            .then(_ => {
              this.refreshMission()
            })
        }
      })
      .catch(error => {
        console.error('checkStatus: getMission: error=', error)
        if (error === 'No such mission') {
          // assume we get back to DRAFT
          this.$q.notify({
            message: `No such mission in the provider. Returning to DRAFT status`,
            timeout: 0,
            closeBtn: 'Close',
            color: 'info'
          })
          this.updateMissionStatus('DRAFT')
            .then(_ => {
              this.refreshMission()
            })
        }
        else {
          this.$q.notify({
            message: `Mission submission error: ${JSON.stringify(error)}`,
            timeout: 0,
            closeBtn: 'Close',
            color: 'info',
          })
        }
      })
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
