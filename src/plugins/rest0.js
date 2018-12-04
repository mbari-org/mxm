export default ({app, router, Vue}) => {
}

// TODO this is still preliminary

export {
  getAssetClasses,
  getMissionDefs,
  postMission,
}

const debug = true

import {axios} from 'plugins/axios'

function getAssetClasses(httpEndpoint) {
  return doGet(httpEndpoint, 'assetclasses')
}

function getMissionDefs(httpEndpoint) {
  return doGet(httpEndpoint, 'missiondefs')
}

function postMission(httpEndpoint, data) {
  return doPost(httpEndpoint, 'missions', data)
}

function doGet(httpEndpoint, route) {
  return new Promise((resolve, reject) => {
    const method = 'GET'
    const url = `${httpEndpoint}/${route}`
    if (debug) console.debug('getGet', 'url=', url)

    axios({method, url})
      .then(response => {
        if (debug) console.debug(`${method} ${url}: response=`, response)
        resolve(response.data.data)
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
