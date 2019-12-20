import axios from 'axios'

const debug = false

const loadConfig = new Promise((resolve, reject) => {
  const method = 'GET'
  const url = 'statics/config/config.json'
  if (debug) console.log(`${method} ${url}`)
  axios({method, url})
    .then(response => {
      if (debug) console.log(`${method} ${url}: response.data=`, response.data)
      const config = response.data
      resolve(config)
    })
    .catch(reject)
})

export default async ({ Vue }) => {
  loadConfig.then(config => {
    Vue.prototype.$mxmConfig = config
  })
  return loadConfig
}

export { loadConfig }
