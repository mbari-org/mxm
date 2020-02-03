FROM node:12.14.1-alpine3.10 AS builder
COPY . /mxm
RUN yarn global add @quasar/cli              && \
    cd /mxm                                  && \
    yarn                                     && \
    quasar build

# --------------------------
FROM httpd:2.4.41-alpine
LABEL maintainer="carueda@mbari.org"
WORKDIR /usr/local/apache2/htdocs/
COPY --from=builder /mxm/dist/spa ./
COPY docker/htaccess              ./.htaccess
RUN  rm -rf                       ./statics/config
