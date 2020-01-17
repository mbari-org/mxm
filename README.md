[![Build Status](https://travis-ci.org/mbari-org/mxm.svg?branch=master)](https://travis-ci.org/mbari-org/mxm)
[![](https://images.microbadger.com/badges/version/mbari/mxm.svg)](https://microbadger.com/images/mbari/mxm)
[![](https://images.microbadger.com/badges/image/mbari/mxm.svg)](https://microbadger.com/images/mbari/mxm)

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

The MXM system consists of three services:

- MXM web application from image `mbari/mxm`
- Postgraphile service from image `graphile/postgraphile`
- MXM postgres database from image `mbari/mxm-postgres`


## Development

- If not already, install dependencies:

      yarn

- Have an MXM GraphQL endpoint running somewhere.
  See `docker/README.md`.

- If not already

      cp config.json.template src/statics/config/config.json

- Adjust `src/statics/config/config.json` as appropriate, in particular, the `graphqlUri` property.

      quasar dev

this will open http://localhost:8080/

## Build

      quasar build

Note that a build is typically for a docker release, so in this case the
particular file `src/statics/config/config.json` is not used.
Instead, the location of the `config.json` file (which is still required)
is indicated as a setting prior to running the container.

### Install

See `docker/README.md`

## misc

Assuming the MXM GraphQL endpoint is running at `localhost:5000/mxm-graphql`,
some client requests:

```
http post localhost:5000/mxm-graphql query='{
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
