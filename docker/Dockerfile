# TODO multi-stage build again
# (basically to remove unneeded node_modules for the quasar-based app,
# but retain the ones for the express-based app)

FROM node:12-alpine
LABEL maintainer="carueda@mbari.org"
LABEL description="Mission Execution Mediation Service"

COPY . /mxm
RUN yarn global add @quasar/cli              \
 && cd /mxm                                  \
 && yarn                                     \
 && quasar build                             \
 # remove statics/config, which will be mapped to a host directory:
 && rm -rf /mxm/dist/spa/statics/config

EXPOSE 3000
WORKDIR /mxm/
ENTRYPOINT ["bin/esm.js"]
