### Webapp:
FROM node:12-alpine AS webapp-builder
COPY ./webapp /mxm-webapp
RUN yarn global add @quasar/cli \
 && cd /mxm-webapp/             \
 && yarn                        \
 && quasar build --modern       \
 # remove statics/config, which will be mounted from
 # a host directory at deployment time:
 && rm -rf /mxm-webapp/dist/spa/statics/config

# package pieces for the final image
# (this includes graphql queries used by the server):
RUN cd /mxm-webapp/   \
 && tar zcf /mxm-webapp.tgz src/graphql dist/spa

### Final image with server and webapp:
FROM node:12-alpine
LABEL maintainer="carueda@mbari.org"
LABEL description="Mission Execution Mediation Service"

# build server:
RUN mkdir /mxm/
COPY ./server /mxm/server
RUN cd /mxm/server/  \
 && yarn

# "install" the built webapp:
COPY --from=webapp-builder /mxm-webapp.tgz /
RUN mkdir -p /mxm/webapp \
 && cd /mxm/webapp/ && tar xf /mxm-webapp.tgz \
 && rm /mxm-webapp.tgz

EXPOSE 3000
WORKDIR /mxm/server/
ENTRYPOINT ["bin/esm.js"]
