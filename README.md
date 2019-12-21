[![Build Status](https://travis-ci.org/mbari-org/mxm.svg?branch=master)](https://travis-ci.org/mbari-org/mxm)

# Mission Execution Mediation Service

**WIP**

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
  allExecutorsList {
    executorId
    httpEndpoint
    apiType
    usesSched
    canValidate
    usesUnits
    description
  }
}'
```
