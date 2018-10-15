Located under this `docker/` subdirectory:

```
./dockerize.sh pxs-ui 0.0.1
```
generates image `mbari/pxs-ui:0.0.1`

```
./dockerize.sh pxspostgres 0.0.1
```
generates image `mbari/pxspostgres:0.0.1`


```
$ docker-compose up -d
Creating network "docker_default" with the default driver
Creating docker_pxspostgres_1 ... done
Creating docker_graphql-engine_1 ... done
Creating docker_pxs-ui_1         ... done
```

Open the PXS UI: http://localhost:38080/
