import gql from 'graphql-tag'

export const ALL_ASSET_CLASSES = gql`
  query allAssetClasses {
    allAssetClasses {
      className
      description
    }
  }
`

export const ASSET_CLASS = gql`
  query assetClass($className: String!) {
    assetClass(className: $className) {
      className
      description
      assets {
        assetId
        description
      }
    }
  }
`

export const ALL_ASSETS = gql`
  query allAssets {
    allAssets {
      className
      assetId
      description
    }
  }
`

export const ASSET = gql`
  query asset($assetId: String!) {
    asset(assetId: $assetId) {
      assetId
      className
      description
    }
  }
`
