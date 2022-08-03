# Some development notes

## All local

Commands below executed using [`just`](https://just.systems/),
see [justfile](justfile) for more details.

### Server

**Create and populate local database**

If starting from scratch, and assuming user with sufficient permissions
on an available Postgres server, for example, on localhost:

    $ just create-database
    psql -h localhost -p 5432 -c 'create database mxm;'
    CREATE DATABASE

    $ just server-populate-database

**Run server**

To use the database above:

    $ just server-run

### Frontend

In another terminal:

Edit `webapp/src/statics/config/config.json`
to indicate: `"graphqlUri": "http://localhost:3000/mxm-graphql"`.

Then:

    $ just webapp-run

which should open <http://localhost:8080/>

NOTE: If one builds the webapp: `just webapp-build`,
then `just server-run` will also serve it
at <http://localhost:3000/>
(using 'serve-static' with reference to `webapp/dist/spa`).

#### Along with `qgeomap`

NOTE: Later on, I decided to copy the `qgeomap` extension code here directly for convenience.
What follows were instructions relevant when using `qgeomap` as an extension.

The qgeomap extension dependency was added via the usual mechanism `quasar ext add @mbari/qgeomap`.
(The actual dependency is `@mbari/quasar-app-extension-qgeomap`).

If also doing adjustments in the extension, do the following to "link"
with the local source code of the extension, instead of the published package:

    yarn unlink @mbari/quasar-app-extension-qgeomap
    yarn add --dev link:../../qgeomap

which of course assumes the indicated path is qgeomap's root directory.
