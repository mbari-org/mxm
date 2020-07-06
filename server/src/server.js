// MXM server.
// Status: very preliminary.

import express from 'express'
import cors from 'cors'
import path from 'path'
import serveStatic from 'serve-static'

import {
  pgPool,
  postgraphileOptions,
} from './base'

import { postgraphile } from "postgraphile"

const app = express()

app.use(cors())

const dbSchema = 'public'

app.use(postgraphile(
  pgPool,
  dbSchema,
  postgraphileOptions
))

// The dir below to serve the Quasar based GUI under a regular complete deployment
// (for development, instead of this, `quasar dev` is typically used in some other terminal session)
const staticDir = '../webapp/dist/spa'
console.log(`staticDir: ${staticDir}`)
app.use(serveStatic(staticDir))

const port = process.env.PORT || 3000
console.log(`mxm listening on port ${port}`)
app.listen(port)
