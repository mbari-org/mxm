import { boot } from 'quasar/wrappers'
import axios from 'axios'

import { version as mxmUiVersion } from '../../package.json'

const debug = window.location.search.match(/.*debug=(-|.*\bconfig\b).*/)

// keep this aligned with server counterpart
interface MxmConfig {
  mxmVersion: string
  graphqlUri: string
  websocketUrl: string
  graphqlUi: string
  graphqlSchema: string
  openapi?: string
  openapiSchema?: string
  swaggerUi?: string
  repoUrl?: string
  learnMoreUrl?: string
  googleApiKey?: string
}

const CONFIG_JSON_PATH = 'mxmConfig.json'

/// MXM_SERVER_URL only used in local dev/test mode, that is, when directly running via `quasar dev`.
/// The specific target server is adjusted as convenient.
const MXM_SERVER_URL = 'http://localhost:8080/' // already running server locally
// const MXM_SERVER_URL = 'http://mxm.shore.mbari.org/'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    mxmConfig: MxmConfig
    mxmUiVersion: string
  }
}

const loadConfig = new Promise<MxmConfig>((resolve, reject) => {
  // with default value for when launched by mxm server
  let url = CONFIG_JSON_PATH

  const isLocalhost = window.location.hostname.match(/localhost.*/)
  const isDirectDevPort = +window.location.port === 9000
  if (isLocalhost && isDirectDevPort) {
    url = MXM_SERVER_URL + CONFIG_JSON_PATH
    console.info(`direct quasar dev mode: getting ${url}`)
  } else {
    if (debug) console.debug('Running in production mode or via quarkus dev')
  }

  const method = 'GET'
  if (debug) console.debug(`${method} ${url}`)
  axios({ method, url })
    .then(response => {
      if (debug)
        console.debug(`${method} ${url}: response.data=`, response.data)
      const config = response.data
      resolve(config)
    })
    .catch(reject)
})

export default boot(async ({ app }) => {
  app.config.globalProperties.mxmUiVersion = mxmUiVersion
  app.config.globalProperties.mxmConfig = await loadConfig
})

export { loadConfig }
