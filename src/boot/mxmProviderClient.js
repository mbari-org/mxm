// Helper to interact with external MXM provider.
// Only 'REST0' interface being implemented at the moment.

import rest0 from 'boot/rest0'

export default ({ Vue }) => {
  Vue.prototype.$createMxmProvideClient = createMxmProvideClient
}

function createMxmProvideClient({httpEndpoint, apiType}) {
  console.log('createMxmProvideClient: httpEndpoint=', httpEndpoint, 'apiType=', apiType)
  return {
    isSupportedInterface,
    getAssetClasses,
    getMissionTpls,
    getMissionById,
    postMission,
  }

  /** Call any of the other methods only if this returns true. */
  function isSupportedInterface() {
    return apiType === 'REST0'
  }

  function getAssetClasses() {
    console.log('getAssetClasses: rest0=', rest0)
    return rest0.getAssetClasses(httpEndpoint)
  }

  function getMissionTpls() {
    return rest0.getMissionTpls(httpEndpoint)
  }

  function getMissionById(missionId) {
    return rest0.getMission(httpEndpoint, missionId)
  }

  function postMission(data) {
    return rest0.postMission(httpEndpoint, data)
  }
}
