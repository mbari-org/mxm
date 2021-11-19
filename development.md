# Some development notes

## All local

**Database**

If starting from scratch, and assuming user with sufficient permissions
on an available Postgres server, for example, on localhost:

    $ psql -h localhost -p 5432
    # create database mxm;
    ^D

    $ psql -h localhost -p 5432 -d mxm < ../docker/mxm-schema.sql

**Run server**

To use the database above:

    $ export PG_CONN_STRING=postgres://postgres@localhost:5432/mxm

Then:

    $ (cd server && bin/esm.js)
    connectionString='postgres://postgres@localhost:5432/mxm'
    staticDir: ../webapp/dist/spa
    mxm listening on port 3000


**Run webapp**

    $ vi webapp/src/statics/config/config.json
      # to indicate: "graphqlUri": "http://localhost:3000/mxm-graphql"

    $ (cd webapp && quasar dev --modern)


## Along with `qgeomap`

The qgeomap extension dependency was added via the usual mechanism `quasar ext add @mbari/qgeomap`.
(The actual dependency is `@mbari/quasar-app-extension-qgeomap`).

If also doing adjustments in the extension, do the following to "link"
with the local source code of the extension, instead of the published package:

    yarn unlink @mbari/quasar-app-extension-qgeomap
    yarn add --dev link:../../qgeomap

which of course assumes the indicated path is qgeomap's root directory.
