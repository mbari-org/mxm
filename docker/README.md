# Building and publishing the images

The user-visible MXM version is the one set in `../package.json`.

## `mbari/mxm`

The MXM images are automatically built and published on Docker Hub:

| Tag                | upon pushing   |
|:-------------      |:-------------  |
| `mbari/mxm:latest` | to the *master* branch |
| `mbari/mxm:x.y.z`  | tag *vx.y.z* |

To build it manually:

    $ cd <to this project's root directory>
    $ docker build -f docker/Dockerfile -t "mbari/mxm:x.y.z" .

## `mbari/mxm-postgres:x.y.z`

The MXM Postgres image is manually created and published as needed.

    docker build -f Dockerfile-postgres -t mbari/mxm-postgres:x.y.z .
    docker push mbari/mxm-postgres:x.y.z


# Launch

With image versions as needed in `docker/docker-compose.yml`:

    cd docker && source setenv.sh && docker-compose up -d

Then open the MXM UI at http://localhost:38080/.
(Again, this will be functional depending on the indicated GraphQL
endpoint in `config.json`, proxy-passes in place on the server, etc.)

The GraphQL UI is at: http://localhost:38080/mxm-graphiql
