# Continuous Deployment

Image build and pushing to Docker Hub are enabled via GitHub Actions.

The automatic update of the running MXM containers on `mxm` is enabled with
the use of [watchtower](https://github.com/containrrr/watchtower/).
The triggering of this update can be done via the watchtower HTTP API
that has been set up there:
```bash
AUTH="Authorization: Bearer ${WATCHTOWER_HTTP_API_TOKEN}"
curl -H "$AUTH" "$MXM_WATCHTOWER_ENDPOINT"
```
But it is more convenient to perform this with the just recipe for that purpose:
```bash
just watchtower-mxm
```
(Env vars for this are captured in uncommitted file `setenv.sh`.)

The `watchtower/compose.yml` file here is a copy of the one
under `~mxmadmin/watchtower/` on `mxm`.
A `.env` file there defines relevant variables.

Complementary to this, the `mbari/mxm` image in `~mxmadmin/MXM/compose.yml`
is defined with only `major.minor` as the version, so that the actual latest version
with that prefix at Docker Hub is used when triggering the update.
```yaml
image: index.docker.io/mbari/mxm:0.9
```

For convenience, I'm also launching the `mxm-provider-example` container
via the same `compose.yml` of the MXM system.
(This container is also handled by watchtower.)

Note: at the moment, for the `mxm-postgres` image, a more manual process is OK as the changes
related with the database (schema, need to reinitialize content, etc.), are more sporadic.
