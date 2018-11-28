# Local development

Under this project's root directory:

```
$ quasar build
```

Then:

```
$ cd docker/
$ ./dockerize.sh pxs 0.0.4
```
generates image `mbari/pxs:0.0.4`

```
$ ./dockerize.sh pxspostgres 0.0.4
```
generates image `mbari/pxspostgres:0.0.4`


```
$ docker-compose up -d
```

Open the PXS UI: http://localhost:38080/

Open the GraphQL UI: http://localhost:5000/pxs-graphiql

# tsauv

## docker-compose.yml

Located under `/opt/tsauv/pxs/` (which I git enabled),
`docker-compose.yml` basically only adjusts the local ports
(pxs=38080; postgraphile=25000; pxspostgres=25432).

NOTE: using a subdir under `/opt/tsauv/` because this is
an actual space under the tsauv VM (ie., not a share, which
would cause the mounted db data volume to fail).

## apache proxy passes

Added the following in `/etc/httpd/conf.d/tsauv.conf`:

```
  <Location /pxs/>
    ProxyPass        http://localhost:38080/
    ProxyPassReverse http://localhost:38080/
  </Location>
  <Location /pxs-graphql>
    ProxyPass        http://localhost:25000/pxs-graphql
    ProxyPassReverse http://localhost:25000/pxs-graphql
  </Location>
```

And also the following, in particular to have a working
graphiql interface (at http://tsauv.shore.mbari.org/pxs-graphiql)
because latest available postgraphile docker image is still 4.0.1,
which does not properly have references to js resources
(it seems this is better handled in 4.1.x):

```
  <Location /pxs-graphiql>
    ProxyPass        http://localhost:25000/pxs-graphiql
    ProxyPassReverse http://localhost:25000/pxs-graphiql
  </Location>
  <Location /_postgraphile/>
    ProxyPass        http://localhost:25000/_postgraphile/
    ProxyPassReverse http://localhost:25000/_postgraphile/
  </Location>
```

Then: `sudo systemctl restart httpd`
