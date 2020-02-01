// module for queries/mutations.
// very preliminary.

export default performQuery

import Promise from 'promise'

import { graphql } from 'graphql'
import { withPostGraphileContext } from 'postgraphile'
import {
  pgPool,
  getSchema,
} from './base'


async function performQuery(query, variables, operationName) {
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
      return await graphql(
        schema, // The schema from `createPostGraphileSchema`
        query,
        null,
        { ...context }, // You can add more to context if you like
        variables,
        operationName
      )
    }
  )
}
