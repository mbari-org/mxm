// MXM server.
// Status: very preliminary.

import express from 'express'
import cors from 'cors'
import path from 'path'
import serveStatic from 'serve-static'

import {
  graphqlRoute,
} from './base'

import mxm from './mxm'

const app = express()

app.use(cors())
app.use(express.json())
app.use(serveStatic(path.join(__dirname, 'dist/spa')))

app.use(graphqlRoute, mxm)

app.listen(process.env.PORT || 3000)
