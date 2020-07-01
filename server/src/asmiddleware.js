// Basic test of postgraphile as middleware.
//   $ node -r esm src/asmiddleware.js

import express from 'express'
import cors from 'cors'

import {
  pgPool,
  graphqlRoute,
  postgraphileOptions,
} from './base'

import { postgraphile } from 'postgraphile'

const app = express();

app.use(cors())

app.use(
  postgraphile(
    pgPool,
    "public",
    postgraphileOptions
  )
)

app.listen(process.env.PORT || 3000);
