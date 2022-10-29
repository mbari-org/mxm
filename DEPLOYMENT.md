# Continuous Deployment

To facilitate the automatic update of the MXM system on `mxm`,
I've again enabled [watchtower](https://github.com/containrrr/watchtower/) there.

The `watchtower/docker-compose.yml` file here is a copy of the one
under `~mxmadmin/watchtower/` on `mxm`.

Complementary to this, the `mbari/mxm` image in `~mxmadmin/MXM/docker-compose.yml`
on the `mxm` machine is defined, not with a specific complete version tag
nor with `latest`, but with just `major.minor` so that the latest version
with the given prefix on Docker Hub is used:
```yaml
image: mbari/mxm:0.9
```

So, triggering the usual docker build workflow from here will subsequently trigger
the automatic update of the deployed system on `mxm`.

Note: For convenience, I'm also launching the `mxm-provider-example` container
via the same `docker-compose.yml` of the MXM system.
(This container is also handled by watchtower.)

Note: at the moment, for the `mxm-postgres` image, a more manual process is OK as the changes
related with the database (schema, need to reinitialize content, etc.), are more sporadic.
