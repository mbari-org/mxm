// very preliminary!

const express = require("express")
const path = require('path')
const serveStatic = require('serve-static')

const { postgraphile } = require("postgraphile")
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgres://mxm@localhost:25432/mxm',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// a simple test
;(async function() {
  const client = await pool.connect()
  const q = 'select * from public.providers'
  const res = await client.query(q)
  client.release()
  console.log(`${q} => `, res.rows)
})()

const app = express();

/* Example middleware you might want to put in front of PostGraphile */
// app.use(require('morgan')(...));
// app.use(require('compression')({...}));
// app.use(require('helmet')({...}));

app.use(serveStatic(path.join(__dirname, 'dist/spa')))

const graphqlRoute = '/graphql'
const graphiqlRoute = '/graphiql'

app.use(express.json())

app.use(graphqlRoute, function (req, res, next) {
  console.log('req.method=', req.method)
  console.log('req.params=', req.params)
  console.log('req.body=', req.body)
  const isMutation = req.body.query && req.body.query.startsWith('mutation')
  console.log('isMutation=', isMutation)
  next()
})

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
    return true;
  },
  enableQueryBatching: true,
  legacyRelations: "omit",
};

app.use(
  postgraphile(
    pool,
    "public",
    postgraphileOptions
  )
);

app.listen(process.env.PORT || 3000);
