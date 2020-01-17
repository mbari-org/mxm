FROM httpd:2.4.41-alpine

LABEL maintainer="carueda@mbari.org"

RUN apk add --update nodejs nodejs-npm       && \
    apk add --update git                     && \
    npm install -g yarn                      && \
    export PATH="$(yarn global bin):$PATH"   && \
    yarn global add @quasar/cli

COPY . /mxm

RUN cd /mxm                                                     && \
    yarn                                                        && \
    quasar build                                                && \
    cp -r dist/spa/*   /usr/local/apache2/htdocs/               && \
    rm -rf             /usr/local/apache2/htdocs/statics/config && \
    cp docker/htaccess /usr/local/apache2/htdocs/.htaccess
