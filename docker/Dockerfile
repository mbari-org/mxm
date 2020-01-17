FROM httpd:2.4.41-alpine AS builder
COPY . /mxm
RUN apk add --update nodejs nodejs-npm       && \
    apk add --update git                     && \
    npm install -g yarn                      && \
    export PATH="$(yarn global bin):$PATH"   && \
    yarn global add @quasar/cli              && \
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
