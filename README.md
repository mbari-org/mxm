# Mission Execution Mediation Service

**WIP**

## Development

### Reqs

- Have the MXM service running, see `docker/README.md`.

- [Quasar Framework](http://quasar-framework.org/)

      npm install -g vue-cli
      npm install -g quasar-cli

### Development

NOTE: Adjust `src/plugins/apollo.js` to set the `uri` of the
MXM GraphQL endpoint as appropriate.

    npm install
    quasar dev

which opens: http://localhost:8080/index.html

Client requests using HTTPie. e.g.:

```
http post localhost:5000/mxm-graphql query='{
  allExecutorsList {
    id
    executorId
    httpEndpoint
    description
  }
}'
```


## Build

NOTE: Again, see if there's any adjustment needed in
`src/plugins/apollo.js`, then:

```
$ quasar build
```

### Install

See `docker/README.md`
