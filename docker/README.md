# Building and publishing the images

The user-visible MXM version is the one set in `../package.json`.

## `mbari/mxm`

The MXM images are automatically built and published on Docker Hub:

- `mbari/mxm:latest` upon pushing to the **master** branch
- `mbari/mxm:x.y.z`  upon pushing tag `vx.y.z`

To build it manually:

    $ cd <to this project's root directory>
    $ docker build -f docker/Dockerfile -t "mbari/mxm:x.y.z" .

## `mbari/mxm-postgres:x.y.z`

The MXM Postgres image is manually created and published as needed.

    docker build -f Dockerfile-postgres -t mbari/mxm-postgres:x.y.z .
    docker push mbari/mxm-postgres:x.y.z


# Launch

With image versions as needed in `docker/docker-compose.yml`:

    cd docker && docker-compose up -d

Then open the MXM UI at http://localhost:38080/.
(Again, this will be functional depending on the indicated GraphQL
endpoint in `config.json`, proxy-passes in place on the server, etc.)

The GraphQL UI is at: http://localhost:5000/mxm-graphiql

# mxm VM

** TO BE UPDATED! **  as system recently migrated to mxm.shore.mbari.org

## docker-compose.yml

Located under `mxm/`,
`docker-compose.yml` basically only adjusts the local ports
(mxm=38080; mxm-postgraphile=25000; mxm-postgres=25432).


## Apache proxy-passes

Added the following in `/etc/httpd/conf.d/mxm.conf`:

```
  <Location /mxm/>
    ProxyPass        http://localhost:38080/
    ProxyPassReverse http://localhost:38080/
  </Location>
  <Location /mxm-graphql>
    ProxyPass        http://localhost:25000/mxm-graphql
    ProxyPassReverse http://localhost:25000/mxm-graphql
  </Location>
```

Also the following, in particular to have a working
graphiql interface (at http://mxm.shore.mbari.org/mxm-graphiql)
because latest available postgraphile docker image is still 4.0.1,
which does not properly have references to js resources
(it seems this is better handled in 4.1.x):

```
  <Location /mxm-graphiql>
    ProxyPass        http://localhost:25000/mxm-graphiql
    ProxyPassReverse http://localhost:25000/mxm-graphiql
  </Location>
  <Location /_postgraphile/>
    ProxyPass        http://localhost:25000/_postgraphile/
    ProxyPassReverse http://localhost:25000/_postgraphile/
  </Location>
```

For the TSAUV Front Tracking REST endpoint for MXM, added
the following on 'tsauv' (see that project for launch instructions):

```
  <Location /tft-mxm/>
    ProxyPass        http://localhost:8040/
    ProxyPassReverse http://localhost:8040/
  </Location>
```

Then: `sudo systemctl restart httpd`

Then open:

- http://mxm.shore.mbari.org/mxm/
- http://mxm.shore.mbari.org/mxm-graphiql
