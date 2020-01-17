# Building the images

**TODO Some of the following being updated**

Note:

- Using *x.y.z* in instructions below just as a placeholder for
  actual version corresponding to the intended target image.

- The user-visible MXM version is set in `../package.json`.

- The version of the postgres image is set directly as needed (see below).

- For deployment, reflect such versions in `docker-compose.yml` for general consistency.


## MXM image

To generate image `mbari/mxm:x.y.z`:

    $ cd <to this project's root directory>
    $ docker build -f docker/Dockerfile -t "mbari/mxm:x.y.z" .


## MXM Postgres image

To generate image `mbari/mxm-postgres:x.y.z`:

    (cd docker && ./dockerize.sh mxm-postgres x.y.z)

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

Located under `/opt/tsauv/mxm/`,
`docker-compose.yml` basically only adjusts the local ports
(mxm=38080; mxm-postgraphile=25000; mxm-postgres=25432).

NOTE: using a subdirectory under `/opt/tsauv/` because that is
an actual space under the 'tsauv' VM (ie., not a share, which
would cause the mounted db data volume to fail).

## Apache proxy-passes

Added the following in `/etc/httpd/conf.d/tsauv.conf`:

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
graphiql interface (at http://tsauv.shore.mbari.org/mxm-graphiql)
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

For the TSAUV Front Tracking REST endpoint for MXM, also added
the following (see that project for launch instructions):

```
  <Location /tft-mxm/>
    ProxyPass        http://localhost:8040/
    ProxyPassReverse http://localhost:8040/
  </Location>
```

Then: `sudo systemctl restart httpd`

Then open:

- http://tsauv.shore.mbari.org/mxm/
- http://tsauv.shore.mbari.org/mxm-graphiql
