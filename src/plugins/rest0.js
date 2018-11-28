export default ({ app, router, Vue }) => {
}

// TODO this is still preliminary

export {
  getMissionDefs,
}

const debug = false

import { axios } from 'plugins/axios'

function getMissionDefs (httpEndpoint) {
  return new Promise((resolve, reject) => {
    const method = 'GET'
    const url = `${httpEndpoint}/missiondefs`
    if (debug) console.debug('getMissionDefs', 'url=', url)

    axios({method, url})
      .then(response => {
        if (debug) console.debug(`${method} ${url}: response=`, response)
        const missionDefs = response.data.data
        resolve(missionDefs)
      })
      .catch(e => {
        reject(e)
      })
  })
}
