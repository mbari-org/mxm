// MXM middleware.
// Status: very preliminary.

export default mxm

import performQuery from './gql'

function mxm(req, res, next) {
  console.log('mxm: req.method=', req.method, '\n',
    'mxm: req.params=', req.params, '\n',
    'mxm: req.body=',   req.body, '\n',
  )
  const { query, variables, operationName } = req.body
  const isMutation = query && query.startsWith('mutation')
  console.log('mxm: isMutation=', isMutation)

  performQuery(query, variables, operationName)
    .then(result => {
      console.log(`mxm GQL: '${query}' => `, result)
      res.json(result)
    })
    .catch(error => {
      console.error(error)
      next()
    })
}

// a query test using postgraphile directly:
;(async function() {
  const query = `query MyQuery {
    allProvidersList {
      apiType
      canValidate
      httpEndpoint
      description
    }
  }`
  const variables = {}
  const operationName = 'MyQuery'
  performQuery(query, variables, operationName)
    .then(result => {
      console.log(`GQL: '${query}' => `, result.data)
    })
})()
