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

// to serve the Quasar based GUI:
const staticDir = './dist/spa'
console.log(`(staticDir: ${staticDir})`)
app.use(serveStatic(staticDir))

const port = process.env.PORT || 3000
console.log(`mxm listening on port ${port}`)
app.listen(port)
