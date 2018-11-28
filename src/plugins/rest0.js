export default ({app, router, Vue}) => {
}

// TODO this is still preliminary

export {
  getAssetClasses,
  getMissionDefs,
}

const debug = true

import {axios} from 'plugins/axios'

function getAssetClasses(httpEndpoint) {
  return doGet(httpEndpoint, 'assetclasses')
}

function getMissionDefs(httpEndpoint) {
  return doGet(httpEndpoint, 'missiondefs')
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
