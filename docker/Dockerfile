FROM node:12-alpine AS builder
COPY . /mxm
RUN yarn global add @quasar/cli              \
 && cd /mxm                                  \
 && yarn                                     \
 && quasar build

# --------------------------
FROM node:12-alpine
LABEL maintainer="carueda@mbari.org"
RUN yarn global add @quasar/cli              \
 && mkdir /mxm
COPY --from=builder /mxm/dist/spa /mxm/
# remove static/config -- this will be mapped to a host directory
RUN  rm -rf ./statics/config
EXPOSE 4000
WORKDIR /mxm/
ENTRYPOINT ["quasar", "serve", ".", "--port", "4000", "--cors"]
