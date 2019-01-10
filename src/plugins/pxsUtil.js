const runInSequence = (promises) => (
  promises.reduce((acum, promise) =>
    acum.then(results =>
      promise.then(result => [ ...results, result ])
    ),
    Promise.resolve([])
  )
)

export default ({ app, Vue }) => {
  Vue.prototype.$pxsUtil = {
    appInfo: {
      version: 'v0.1.0',
    },
    runInSequence,
  }
}

