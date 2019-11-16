import UtlDialog from 'components/utl/utl-dialog'

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
      version: 'v0.2.1',
    },
    runInSequence,
  }

  Vue.component('utl-dialog', UtlDialog)
}