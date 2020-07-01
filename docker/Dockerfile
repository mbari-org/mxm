# TODO multi-stage build again
# (basically to remove unneeded node_modules for the quasar-based app,
# but retain the ones for the express-based app)

FROM node:12-alpine
LABEL maintainer="carueda@mbari.org"
LABEL description="Mission Execution Mediation Service"

COPY . /mxm
RUN \
 # Server:
 cd /mxm/server/  \
 && yarn          \
 #
 # Webapp:
 && yarn global add @quasar/cli \
 && cd /mxm/webapp/             \
 && yarn                        \
 && quasar build --modern       \
 #
 # remove statics/config, which will be mounted from
 # a host directory at deployment time:
 && rm -rf /mxm/webapp/dist/spa/statics/config

EXPOSE 3000
WORKDIR /mxm/server/
ENTRYPOINT ["bin/esm.js"]
