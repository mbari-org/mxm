// Some basic defs.

import {
  createPostGraphileSchema,
} from 'postgraphile'
import { Pool } from 'pg'

const pgPool = new Pool({
  connectionString: 'postgres://mxm@localhost:25432/mxm',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// a simple test of querying db directly:
;(async function() {
  const client = await pgPool.connect()
  const q = 'select * from public.providers'
  const res = await client.query(q)
  client.release()
  console.log(`DB: '${q}' => `, res.rows)
})()

const graphqlRoute = '/graphql'
const graphiqlRoute = '/graphiql'

const postgraphileOptions = {
  graphqlRoute,
  graphiqlRoute,

  // fist settings below reflecting what we've had in docker compose
  classicIds: true,
  exportGqlSchemaPath: "schema.graphql",
  sortExport: true,
  graphiql: true,
  enhanceGraphiql: true,
  enableCors: true,
  simpleCollections: 'only',

  pgSettings(req) {
    /* TODO */
  },

  // TODO review the following
  subscriptions: false,
  watchPg: true,
  dynamicJson: true,
  setofFunctionsContainNulls: false,
  ignoreRBAC: false,
  ignoreIndexes: false,
  showErrorStack: "json",
  extendedErrors: ["hint", "detail", "errcode"],
  // appendPlugins: [require("@graphile-contrib/pg-simplify-inflector")],
  allowExplain(req) {
    // TODO: customise condition!
    return true
  },
  enableQueryBatching: true,
  legacyRelations: "omit",
}

let schema = null

const getSchema = () => new Promise((resolve, reject) => {
  if (schema) {
    resolve(schema)
  }
  else {
    createPostGraphileSchema(
      pgPool,
      "public",
      postgraphileOptions
    )
      .then(_schema => {
        schema = _schema
        // console.log('Got schema=', schema)
        resolve(schema)
      })
      .catch(error => {
        console.error(error)
        reject(error)
      })
  }
})

export {
  getSchema,
  pgPool,
  graphqlRoute,
  graphiqlRoute,
  postgraphileOptions,
}
