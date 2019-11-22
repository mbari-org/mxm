import UtlDialog from 'components/utl/utl-dialog'
import UtlBreadcrumbs from 'components/utl/utl-breadcrumbs'
import UtlExpansion from 'components/utl/utl-expansion'
import MxmMarkdown from 'components/mxm-markdown'
import { version } from '../../package.json'
import map from 'lodash/map'

export default ({ app, Vue, router }) => {
  Vue.prototype.$utl = {
    appInfo: {
      version,
    },

    routeLoc,

    push(loc) {
      router.push(routeLoc(loc))
    },

    replace(loc) {
      router.replace(routeLoc(loc))
    },

    runInSequence,
  }

  Vue.component('utl-dialog', UtlDialog)
  Vue.component('utl-breadcrumbs', UtlBreadcrumbs)
  Vue.component('utl-expansion', UtlExpansion)
  Vue.component('mxm-markdown', MxmMarkdown)
}

function routeLoc(loc) {
  if (Array.isArray(loc)) {
    return '/' + map(loc, encodeURIComponent).join('/')
  }
  else return loc
}

function runInSequence(promises) {
  return promises.reduce((acum, promise) => acum.then(results =>
      promise.then(result => [...results, result])
    ),
    Promise.resolve([])
  )
}
