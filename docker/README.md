# Building the images

Adjust the GraphQL endpoint URI in `src/plugins/apollo.js`
depending on how you are going to run the UI below.

Note:

- Using *x.y.z* in instruction below just as a placeholder for
  actual version corresponding to the target image.
- The MXMS version is set in `pxsUtil.js`
- Reflect such versions in `docker-compose.yml` for general consistency.

```
$ cd <to this project's root directory>
$ (quasar build && cd docker && ./dockerize.sh mxms x.y.z)
```
generates image `mbari/mxms:x.y.z`

```
$ (cd docker && ./dockerize.sh mxmspostgres x.y.z)
```
generates image `mbari/mxmspostgres:x.y.z`


```
$ docker-compose up -d
```

Open the UI: http://localhost:38080/
(again, this will be functional depending on the indicated GraphQL
endpoint, proxy-passes in place, etc.)

Open the GraphQL UI: http://localhost:5000/mxms-graphiql

# TSAUV

## docker-compose.yml

Located under `/opt/tsauv/pxs/`,
`docker-compose.yml` basically only adjusts the local ports
(mxms=38080; postgraphile=25000; mxmspostgres=25432).

NOTE: using a subdirectory under `/opt/tsauv/` because that is
an actual space under the 'tsauv' VM (ie., not a share, which
would cause the mounted db data volume to fail).

## Apache proxy-passes

Added the following in `/etc/httpd/conf.d/tsauv.conf`:

```
  <Location /mxms/>
    ProxyPass        http://localhost:38080/
    ProxyPassReverse http://localhost:38080/
  </Location>
  <Location /mxms-graphql>
    ProxyPass        http://localhost:25000/mxms-graphql
    ProxyPassReverse http://localhost:25000/mxms-graphql
  </Location>
```

Also the following, in particular to have a working
graphiql interface (at http://tsauv.shore.mbari.org/mxms-graphiql)
because latest available postgraphile docker image is still 4.0.1,
which does not properly have references to js resources
(it seems this is better handled in 4.1.x):

```
  <Location /mxms-graphiql>
    ProxyPass        http://localhost:25000/mxms-graphiql
    ProxyPassReverse http://localhost:25000/mxms-graphiql
  </Location>
  <Location /_postgraphile/>
    ProxyPass        http://localhost:25000/_postgraphile/
    ProxyPassReverse http://localhost:25000/_postgraphile/
  </Location>
```

For the TSAUV Front Tracking REST endpoint for MXMS, also added
the following (see that project for launch instructions):

```
  <Location /tft-mxms/>
    ProxyPass        http://localhost:8040/
    ProxyPassReverse http://localhost:8040/
  </Location>
```

Then: `sudo systemctl restart httpd`
