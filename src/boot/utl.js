import UtlDialog from 'components/utl/utl-dialog'
import UtlBreadcrumbs from 'components/utl/utl-breadcrumbs'
import { version } from '../../package.json'

const runInSequence = (promises) => (
  promises.reduce((acum, promise) =>
      acum.then(results =>
        promise.then(result => [ ...results, result ])
      ),
    Promise.resolve([])
  )
)

export default ({ app, Vue }) => {
  Vue.prototype.$utl = {
    appInfo: {
      version,
    },
    runInSequence,
  }

  Vue.component('utl-dialog', UtlDialog)
  Vue.component('utl-breadcrumbs', UtlBreadcrumbs)
}
