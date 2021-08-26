![Build Status](https://github.com/mbari-org/mxm/actions/workflows/ci.yml/badge.svg)
[![](https://img.shields.io/docker/cloud/build/mbari/mxm)](https://hub.docker.com/r/mbari/mxm)
[![](https://img.shields.io/docker/cloud/automated/mbari/mxm)](https://hub.docker.com/r/mbari/mxm)

# Mission Execution Mediation Service

**WIP**

The Mission Execution Mediation Service (MXM) effort seeks to provide a set of
programmatic and user interfaces to integrate mission information across
diverse mission execution systems at MBARI, as well as to support the integration
of third-party applications, in particular to facilitate extended planning
capabilities on MBARI assets

The proposed MXM interfaces will support a unified view of the information in terms
of available mission definitions, parameterization, scheduling, and execution status.

## The MXM system

The MXM system consists of the following components:

- MXM service and webapp (docker image: `mbari/mxm`)
- MXM postgres database (docker image: `mbari/mxm-postgres`)

## Install

See [`docker/README.md`](docker/README.md).

## Development

Dependencies:

    (cd server && yarn)
    yarn global add @quasar/cli
    (cd webapp && yarn)

### Webapp

    cd webapp/

Have an MXM GraphQL endpoint running somewhere.
(See [`docker/README.md`](docker/README.md).)

If not already

      cp config.json.template src/statics/config/config.json

Adjust `src/statics/config/config.json` as appropriate,
in particular, the `graphqlUri` property.

      quasar dev --modern

this will open http://localhost:8080/

### Build

      quasar build --modern

Note that a build is typically intended for a docker release, so in this case the
particular file `src/statics/config/config.json` is NOT used.
Instead, the location of the `config.json` file (which is still required)
is indicated as a setting prior to running the container.
See [`docker/README.md`](docker/README.md).

## Misc

Assuming the MXM GraphQL endpoint is running at `localhost:38080/mxm-graphql`,
some client requests (using [curlie](https://curlie.io/)):

```
curlie post localhost:38080/mxm-graphql query='{
  allProvidersList {
    providerId
    httpEndpoint
    apiType
    usesSched
    canValidate
    usesUnits
    description
  }
}'
```

```
curlie post 'http://localhost:38080/mxm-graphql' <<<'
  {
   "operationName": "createProvider",
   "variables": {
     "input": {
       "provider": {
         "providerId": "SomeProv",
         "httpEndpoint": "http://example.net/api/mxm",
         "apiType": "GRAPHQL"
        }
      }
    },
    "query": "mutation createProvider($input: CreateProviderInput!) { createProvider(input: $input) { provider { providerId httpEndpoint apiType description canValidate usesUnits usesSched descriptionFormat } } }"
}'
```
