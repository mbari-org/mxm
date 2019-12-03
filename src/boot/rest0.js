// TODO this is still preliminary

export default {
  getAssetClasses,
  getUnits,
  getMissionTpls,
  postMission,
  getMission,
}

const debug = true

import {axios} from 'boot/axios'

function getAssetClasses(httpEndpoint) {
  return doGet(httpEndpoint, 'assetclasses')
}

function getUnits(httpEndpoint) {
  return doGet(httpEndpoint, 'units')
}

function getMissionTpls(httpEndpoint) {
  return doGet(httpEndpoint, 'missiontpls')
}

function postMission(httpEndpoint, data) {
  return doPost(httpEndpoint, 'missions', data)
}

function getMission(httpEndpoint, missionId) {
  return doGet(httpEndpoint, `missions/${missionId}`)
}

function doGet(httpEndpoint, route) {
  return new Promise((resolve, reject) => {
    const method = 'GET'
    const url = `${httpEndpoint}/${route}`
    if (debug) console.debug('getGet', 'url=', url)

    axios({method, url})
      .then(response => {
        if (debug) console.debug(`${method} ${url}: response=`, response)
        if (response.data.error) {
          reject(response.data.error)
        }
        else {
          // TODO cleanup.  For now:
          //    response.data.result: TethysDash
          //    response.data.data: TFT
          resolve(response.data.result || response.data.data)
        }
      })
      .catch(e => {
        reject(e)
      })
  })
}

function doPost(httpEndpoint, route, data) {
  return new Promise((resolve, reject) => {
    const method = 'POST'
    const url = `${httpEndpoint}/${route}`
    if (debug) console.debug('doPost', 'url=', url, 'data=', data)

    axios({method, url, data})
      .then(response => {
        if (debug) console.debug(`${method} ${url}: response=`, response)
        if (response.data.error) {
          reject(response.data.error)
        }
        else {
          resolve(response.data.data)
        }
      })
      .catch(e => {
        reject(e)
      })
  })
}
