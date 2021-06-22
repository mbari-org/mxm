# Building and publishing the images

**NOTE**: These notes combine both building and using the images.
General user-oriented instructions is a TODO.

The user-visible MXM version is the one set in `../webapp/package.json`.

## `mbari/mxm`

The MXM images are automatically built and published at Docker Hub:

| Tag                | upon pushing           |
|:-------------      |:-------------          |
| `mbari/mxm:latest` | to the *master* branch |
| `mbari/mxm:x.y.z`  | tag *vx.y.z*           |

To build it manually:

    $ cd <to this project's root directory>
    $ docker build -f docker/Dockerfile -t "mbari/mxm:x.y.z" .

## `mbari/mxm-postgres:x.y.z`

The MXM Postgres image is manually created and published as needed.

    docker build -f Dockerfile-postgres -t mbari/mxm-postgres:x.y.z .
    docker push mbari/mxm-postgres:x.y.z

# Launch

- Some configuration is to be given in a `config.json` file under directory
  indicated by environment variable `MXM_CONFIG_DIR`, by default `config/`.
  The settings in `config.json` are as follows:

        {
          "graphqlUri": "/mxm-graphql",
          "learnMoreUrl": "https://docs.google.com/document/d/....",
          "googleApiKey": "..."
        }

    - `graphqlUri`:  Location of the GraphQL endpoint. The value above is
      OK for a typical docker based installation.
    - `learnMoreUrl`: Link to documentation.
    - `googleApiKey`:  Optional to include Google based features.

- Do any relevant adjustments in `setenv.sh`.
  Basically just to indicate location of your `config.json` file.

- Do any adjustments in `docker-compose.yml`, in particular regarding image versions.

- Then:

        source setenv.sh
        docker-compose up -d
        docker logs -f --tail=20 mxm

The MXM UI will be available at http://localhost:38080/

The GraphQL UI at: http://localhost:38080/mxm-graphiql

In general, the system will be functional depending on the indicated GraphQL
endpoint in `config.json`, proxy-passes in place on the server if you are
exposing the system externally, etc.
