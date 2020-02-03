// Some basic defs.

import {
  createPostGraphileSchema,
} from 'postgraphile'
import { Pool } from 'pg'

const pgPool = new Pool({
  connectionString: process.env.PG_CONN_STRING || 'postgres://mxm@localhost:25432/mxm',
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

const graphqlRoute = '/mxm-graphql'
const graphiqlRoute = '/mxm-graphiql'

const postgraphileOptions = {
  graphqlRoute,
  graphiqlRoute,

  // for docker-compose startup: "wait" until mxm-postgres is up
  retryOnInitFail: true,

  // fist settings below reflecting what we've had in docker compose
  classicIds: true,
  exportGqlSchemaPath: "schema.graphql",
  sortExport: true,
  graphiql: true,
  enhanceGraphiql: true,
  enableCors: true,
  simpleCollections: 'only',

  // NOTE: Documentation for `legacyRelations`:
  //   "Some one-to-one relations were previously detected as one-to-many -
  //   should we export 'only' the old relation shapes,
  //   both new and old but mark the old ones as 'deprecated' (default),
  //   or 'omit' (recommended) the old relation shapes entirely."
  // I'm letting the default `deprecated` take place in consistency with the
  // way postgraphile is launched in docker-compose.yml (no explicit `--legacy-relations` there).
  // But this all is a bit confusing because I'm not seeing anything marked 'deprecated'
  // in the generated schema, and when I use 'omit' then several elements are
  // not created thus causing several queries to fail.
  // TODO this all will need some more careful revision at some point.

  // The folling from the documentation as a "quick" reference but commented out:
  // subscriptions: false,
  // watchPg: true,
  // dynamicJson: true,
  // setofFunctionsContainNulls: false,
  // ignoreRBAC: false,
  // ignoreIndexes: false,
  // showErrorStack: "json",
  // extendedErrors: ["hint", "detail", "errcode"],
  // // appendPlugins: [require("@graphile-contrib/pg-simplify-inflector")],
  // allowExplain(req) {
  //   // TODO: customise condition!
  //   return true
  // },
  // enableQueryBatching: true,
  // pgSettings(req) {
  //   /* TODO */
  // },
}

let schema = null

/**
 * Gets the schema.
 * Re-attempts connection to the database, which in particular
 * allows for needed handling at launch time via docker-compose.
 */
const getSchema = async () => {
  if (schema) {
    return schema
  }
  else {
    const maxAttempts = 20
    const sleepMs = 1000
    let lastError = null
    for (let attempt = 1; attempt <= 20; attempt++) {
      console.log(`\n-- getting schema (attempt=${attempt}/${maxAttempts}) --`)
      try {
        schema = await createPostGraphileSchema(
          pgPool,
          "public",
          postgraphileOptions
        )
        console.log(`Got schema after ${attempt} attempt`, schema)
        return schema
      }
      catch (error) {
        lastError = error
        await new Promise(resolve => setTimeout(resolve, sleepMs))
      }
    }
    console.error(`Could not get schema after ${maxAttempts} attempts.`, lastError)
    throw lastError
  }
}

export {
  getSchema,
  pgPool,
  graphqlRoute,
  graphiqlRoute,
  postgraphileOptions,
}
