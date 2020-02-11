// module for queries/mutations.
// very preliminary.

import fs from "fs"

const readGql = baseName => fs.readFileSync(`src/graphql/${baseName}.gql`, {encoding: 'utf8'})

const Gql = {
  assetClassInsert:            () => readGql('assetClassInsert'),
  assetInsert:                 () => readGql('assetInsert'),
  unitInsert:                  () => readGql('unitInsert'),
  missionTplInsert:            () => readGql('missionTplInsert'),
  missionTplAssetClassInsert:  () => readGql('missionTplAssetClassInsert'),
  parameterInsert:             () => readGql('parameterInsert'),
  missionByID:                 () => readGql('missionByID'),
}


export { Gql, performQuery }

import Promise from 'promise'

import { graphql } from 'graphql'
import { withPostGraphileContext } from 'postgraphile'
import {
  pgPool,
  getSchema,
} from './base'


async function performQuery(query, variables, operationName, context_) {
  const schema = await getSchema()
  return await withPostGraphileContext(
    {
      pgPool,
      // jwtToken,
      // jwtSecret: "...",
      // pgDefaultRole: "..."
    },
    async context => {
      // Execute your GraphQL query in this function with the provided
      // `context` object, which should NOT be used outside of this
      // function.
      context_ = context_ || {}
      return await graphql(
        schema, // The schema from `createPostGraphileSchema`
        query,
        null,
        { ...context, ...context_ }, // You can add more to context if you like
        variables,
        operationName
      )
    }
  )
}
