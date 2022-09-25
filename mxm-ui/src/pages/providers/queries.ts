import gql from 'graphql-tag'

export const ALL_PROVIDERS = gql`
  query allProviders {
    allProviders {
      providerId
      httpEndpoint
      apiType
      description
      descriptionFormat
    }
  }
`

export const PING_PROVIDER = gql`
  mutation pingProvider($pl: ProviderInput!) {
    pingProvider(pl: $pl) {
      result {
        datetime
      }
    }
  }
`

export const CREATE_PROVIDER = gql`
  mutation createProvider($pl: ProviderInput!) {
    createProvider(pl: $pl) {
      providerId
      httpEndpoint
      apiType
      description
      canValidate
      usesUnits
      usesSched
      descriptionFormat
    }
  }
`

export const DELETE_PROVIDER = gql`
  mutation deleteProvider($pl: ProviderInput!) {
    deleteProvider(pl: $pl) {
      providerId
      httpEndpoint
      description
      descriptionFormat
    }
  }
`

export const PROVIDER_CREATED = gql`
  subscription providerCreated {
    providerCreated {
      providerId
      httpEndpoint
      apiType
      description
      descriptionFormat
    }
  }
`

export const PROVIDER_UPDATED = gql`
  subscription providerUpdated {
    providerUpdated {
      providerId
      httpEndpoint
      apiType
      description
      descriptionFormat
    }
  }
`

export const PROVIDER_DELETED = gql`
  subscription providerDeleted {
    providerDeleted {
      providerId
      httpEndpoint
      apiType
      description
      descriptionFormat
    }
  }
`

export const PROVIDER_SUMMARY = gql`
  query provider($providerId: String!) {
    provider(providerId: $providerId) {
      providerId
      httpEndpoint
      apiType
      description
      canValidate
      canReportMissionStatus
      usesUnits
      usesSched
      descriptionFormat
      numActualMissionTemplates
      numAssetClasses
      numAssets
      numUnits
      numMissions
    }
  }
`

export const PROVIDER = gql`
  query provider($providerId: String!) {
    provider(providerId: $providerId) {
      providerId
      httpEndpoint
      apiType
      description
      canValidate
      canReportMissionStatus
      usesUnits
      usesSched
      descriptionFormat
      missionTemplates {
        providerId
        missionTplId
        description
        assetClasses {
          providerId
          className
          assets {
            providerId
            assetId
          }
        }
      }
      missions {
        providerId
        missionTplId
        missionId
        providerMissionId
        updatedDate
        missionStatus
        assetId
        description
        startDate
        endDate
      }
      assetClasses {
        providerId
        className
        assets {
          providerId
          assetId
        }
      }
      units {
        providerId
        unitName
      }
    }
  }
`

export const PROVIDER_UPDATED_BY_ID = gql`
  subscription providerUpdatedById($providerId: String!) {
    providerUpdatedById(providerId: $providerId) {
      providerId
      httpEndpoint
      apiType
      description
      descriptionFormat
    }
  }
`

export const PROVIDER_API_TYPES = gql`
  query providerApiTypes {
    __type(name: "ProviderApiType") {
      enumValues {
        name
      }
    }
  }
`

export const MISSION_TEMPLATE_BASIC = gql`
  query getMissionTplBasic($providerId: String!, $missionTplId: String!) {
    missionTemplate(providerId: $providerId, missionTplId: $missionTplId) {
      providerId
      missionTplId
      retrievedAt
    }
  }
`

export const MISSION_TEMPLATES_DIRECTORY = gql`
  query missionTplsDirectory($providerId: String!, $directory: String!) {
    listMissionTplsDirectory(providerId: $providerId, directory: $directory) {
      providerId
      provider {
        providerId
        descriptionFormat
      }
      missionTplId
      description
      assetClasses {
        providerId
        className
        assets {
          providerId
          assetId
        }
      }
    }
  }
`

export const UPDATE_MISSION_TEMPLATE = gql`
  mutation updateMissionTemplate($pl: MissionTemplateInput!) {
    updateMissionTemplate(pl: $pl) {
      providerId
      missionTplId
      description
      retrievedAt
    }
  }
`

export const MISSION_TEMPLATE = gql`
  query getMissionTpl($providerId: String!, $missionTplId: String!) {
    missionTemplate(providerId: $providerId, missionTplId: $missionTplId) {
      providerId
      missionTplId
      description
      retrievedAt
      provider {
        providerId
        descriptionFormat
        usesUnits
        usesSched
        canReportMissionStatus
      }
      assetClasses {
        providerId
        className
        description
      }
      parameters {
        providerId
        missionTplId
        paramName
        type
        valueCanReference
        required
        defaultValue
        defaultUnits
        description
        paramOrder
      }
    }
  }
`

export const PARAMETER = gql`
  query parameter(
    $providerId: String!
    $missionTplId: String!
    $paramName: String!
  ) {
    parameter(
      providerId: $providerId
      missionTplId: $missionTplId
      paramName: $paramName
    ) {
      providerId
      missionTplId
      paramName
      type
      required
      defaultValue
      defaultUnits
      valueCanReference
      description
      provider {
        providerId
        descriptionFormat
      }
    }
  }
`

export const DERIVED_UNITS = gql`
  query derivedUnits($providerId: String!, $unitName: String!) {
    unit(providerId: $providerId, unitName: $unitName) {
      providerId
      unitName
      abbreviation
      baseUnit
      derivedUnits {
        providerId
        unitName
        abbreviation
        baseUnit
      }
    }
  }
`

export const ASSET_CLASSES = gql`
  query assetClassesForProvider($providerId: String!) {
    assetClassesForProvider(providerId: $providerId) {
      providerId
      provider {
        providerId
        descriptionFormat
      }
      className
      description
    }
  }
`

export const ASSET_CLASS = gql`
  query assetClass($providerId: String!, $className: String!) {
    assetClass(providerId: $providerId, className: $className) {
      providerId
      className
      description
      provider {
        providerId
        descriptionFormat
      }
      assets {
        providerId
        assetId
        description
      }
    }
  }
`

export const ASSETS = gql`
  query assetForProvider($providerId: String!) {
    assetsForProvider(providerId: $providerId) {
      providerId
      provider {
        providerId
        descriptionFormat
      }
      className
      assetId
      description
    }
  }
`

export const ASSET = gql`
  query asset($providerId: String!, $assetId: String!) {
    asset(providerId: $providerId, assetId: $assetId) {
      providerId
      assetId
      className
      description
      assetClass {
        providerId
        className
        provider {
          providerId
          descriptionFormat
        }
      }
    }
  }
`

export const UNITS = gql`
  query unitsForProvider($providerId: String!) {
    unitsForProvider(providerId: $providerId) {
      providerId
      unitName
      abbreviation
      baseUnit
    }
  }
`

export const MISSION_INSERT = gql`
  mutation createMission($pl: MissionInput!) {
    createMission(pl: $pl) {
      providerId
      missionTplId
      missionId
      missionStatus
      assetId
      description
      schedType
      schedDate
      startDate
      endDate
    }
  }
`

export const MISSION_UPDATE = gql`
  mutation updateMission($pl: MissionInput!) {
    updateMission(pl: $pl) {
      providerId
      missionTplId
      missionId
      missionStatus
      updatedDate
      providerMissionId
      description
      assetId
      startDate
      endDate
    }
  }
`

export const MISSION_DELETE = gql`
  mutation deleteMission($pl: MissionInput!) {
    deleteMission(pl: $pl) {
      providerId
      missionTplId
      missionId
      description
      assetId
    }
  }
`

export const MISSION = gql`
  query mission(
    $providerId: String!
    $missionTplId: String!
    $missionId: String!
  ) {
    mission(
      providerId: $providerId
      missionTplId: $missionTplId
      missionId: $missionId
    ) {
      providerId
      missionTplId
      missionId
      missionStatus
      updatedDate
      providerMissionId
      assetId
      schedType
      schedDate
      asset {
        className
      }
      description
      arguments {
        paramName
        paramValue
        paramUnits
      }
      provider {
        providerId
        httpEndpoint
        apiType
        canValidate
        usesSched
        usesUnits
        canReportMissionStatus
        descriptionFormat
      }
      missionTemplate {
        providerId
        missionTplId
        retrievedAt
        parameters {
          providerId
          missionTplId
          paramName
          type
          valueCanReference
          required
          defaultValue
          defaultUnits
          description
        }
      }
    }
  }
`

export const ARGUMENT_INSERT = gql`
  mutation createArgument($pl: ArgumentInput!) {
    createArgument(pl: $pl) {
      missionId
      providerId
      missionTplId
      paramName
      paramValue
      paramUnits
    }
  }
`

export const ARGUMENT_UPDATE = gql`
  mutation updateArgument($pl: ArgumentInput!) {
    updateArgument(pl: $pl) {
      missionId
      providerId
      missionTplId
      paramName
      paramValue
      paramUnits
    }
  }
`

export const ARGUMENT_DELETE = gql`
  mutation deleteArgument($pl: ArgumentInput!) {
    deleteArgument(pl: $pl) {
      missionId
      providerId
      missionTplId
      paramName
      paramValue
    }
  }
`
