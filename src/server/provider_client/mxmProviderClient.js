// Helper to interact with external MXM provider.
// Only 'REST0' interface being implemented at the moment.

import rest0 from './rest0'

export default function createMxmProvideClient({httpEndpoint, apiType}) {
  console.log('createMxmProvideClient: httpEndpoint=', httpEndpoint, 'apiType=', apiType)
  return {
    isSupportedInterface,
    getCapabilities,
    getAssetClasses,
    getUnits,
    getMissionTpls,
    getMissions,
    getMissionById,
    postMission,
  }

  /** Call any of the other methods only if this returns true. */
  function isSupportedInterface() {
    return apiType.toUpperCase() === 'REST0'
  }

  function getCapabilities() {
    return rest0.getCapabilities(httpEndpoint)
  }

  function getAssetClasses() {
    return rest0.getAssetClasses(httpEndpoint)
  }

  function getUnits() {
    return rest0.getUnits(httpEndpoint)
  }

  function getMissionTpls() {
    return rest0.getMissionTpls(httpEndpoint)
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
