// Basic test of postgraphile as middleware.
//   $ node server/asmiddleware.js

const express = require("express")
const path = require('path')
const serveStatic = require('serve-static')

const {
    pgPool,
    graphqlRoute,
    postgraphileOptions,
  } = require('./base')

const app = express();

app.use(serveStatic(path.join(__dirname, 'dist/spa')))

const { postgraphile } = require("postgraphile")
app.use(
  postgraphile(
    pgPool,
    "public",
    postgraphileOptions
  )
)

app.listen(process.env.PORT || 3000);
