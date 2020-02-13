// module for queries/mutations.
// very preliminary.

import fs from "fs"

const readGql = baseName => fs.readFileSync(`src/graphql/${baseName}.gql`, {encoding: 'utf8'})

const Gql = {
  providerBasic:               () => readGql('providerBasic'),
  assetClassInsert:            () => readGql('assetClassInsert'),
  assetInsert:                 () => readGql('assetInsert'),
  unitInsert:                  () => readGql('unitInsert'),
  missionTplInsert:            () => readGql('missionTplInsert'),
  missionTplAssetClassInsert:  () => readGql('missionTplAssetClassInsert'),
  parameterInsert:             () => readGql('parameterInsert'),
  missionByID:                 () => readGql('missionByID'),
}


export {
  Gql,
  getMissionTplByID,
  deleteMissionTplByID,
  performQuery,
}

import { graphql } from 'graphql'
import { withPostGraphileContext } from 'postgraphile'
import {
  pgPool,
  getSchema,
} from './base'


async function getMissionTplByID(context, id) {
  const query = readGql('missionTplByID')
  const variables = { id }
  const operationName = 'missionTplByID'
  const result = await performQuery(query, variables, operationName, context)
  /*if (debug)*/ console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
  return result.data.missionTpl
}

async function deleteMissionTplByID(context, id) {
  const query = readGql('missionTplDelete')
  const variables = {
    input: {
      id
    }
  }
  const operationName = 'deleteMissionTpl'
  const result = await performQuery(query, variables, operationName, context)
  /*if (debug)*/ console.log(`PERFORMED query='${query}', variables=${variables} => result=`, result)
}

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
