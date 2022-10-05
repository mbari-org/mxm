# Continuous Deployment

To facilitate the automatic update of the MXM system on `mxm`,
I've again enabled [watchtower](https://github.com/containrrr/watchtower/) there.

The `watchtower/docker-compose.yml` file here is a copy of the one
under `~mxmadmin/watchtower/` on `mxm`.

Complementary to this, the `mbari/mxm` image in the MXM `docker-compose.yml` on `mxm`
is set without explicit tag, so that the latest version on Docker Hub is always used.

So, triggering the usual docker build workflow from here will subsequently trigger
the automatic update of the deployed system on `mxm`.

Note: At this point, a more manual process is OK when there are changes related with the
mxm-postgres image (database schema, need to reinitialize database, etc.).
