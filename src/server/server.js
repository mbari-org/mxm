// MXM server.
// Status: very preliminary.

import express from 'express'
import path from 'path'
import serveStatic from 'serve-static'

import {
  graphqlRoute,
} from './base'

import mxm from './mxm'

const app = express()

app.use(serveStatic(path.join(__dirname, 'dist/spa')))

app.use(express.json())

app.use(graphqlRoute, mxm)

app.listen(process.env.PORT || 3000)
