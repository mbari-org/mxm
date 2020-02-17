// Helper to interact with external MXM provider.
// Only 'REST0' interface being implemented at the moment.

import rest0 from './rest0'

export default function createMxmProviderClient({providerId, httpEndpoint, apiType}) {
  // console.log('createMxmProviderClient: providerId=',providerId, ' httpEndpoint=', httpEndpoint, 'apiType=', apiType)
  return {
    providerId,
    isSupportedInterface,
    getGeneralInfo,
    ping,
    getAssetClasses,
    getUnits,
    listMissionTemplates,
    getMissionTemplate,
    getMissions,
    getMissionById,
    postMission,
  }

  /** Call any of the other methods only if this returns true. */
  function isSupportedInterface() {
    return apiType && apiType.toUpperCase() === 'REST0'
  }

  function getGeneralInfo() {
    return rest0.getGeneralInfo(httpEndpoint)
  }

  function ping() {
    return rest0.ping(httpEndpoint)
  }

  function getAssetClasses() {
    return rest0.getAssetClasses(httpEndpoint)
  }

  function getUnits() {
    return rest0.getUnits(httpEndpoint)
  }

  function listMissionTemplates(directory) {
    return rest0.listMissionTemplates(httpEndpoint, directory)
  }

  function getMissionTemplate(filePath) {
    return rest0.getMissionTemplate(httpEndpoint, filePath)
  }

  function getMissions() {
    return rest0.getMissions(httpEndpoint)
  }

  function getMissionById(missionId) {
    return rest0.getMission(httpEndpoint, missionId)
  }

  function postMission(data) {
    return rest0.postMission(httpEndpoint, data)
  }
}
