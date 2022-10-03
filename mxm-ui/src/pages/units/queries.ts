import gql from 'graphql-tag'

export const UNITS = gql`
  query allUnits {
    allUnits {
      unitName
      abbreviation
      baseUnit
    }
  }
`

export const DERIVED_UNITS = gql`
  query derivedUnits($unitName: String!) {
    unit(unitName: $unitName) {
      unitName
      abbreviation
      baseUnit
      derivedUnits {
        unitName
        abbreviation
        baseUnit
      }
    }
  }
`
