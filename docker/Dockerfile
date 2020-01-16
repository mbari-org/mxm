FROM httpd:2.4.41-alpine

LABEL maintainer="carueda@mbari.org"

# NOTE: For now cloning from github for the build
# TODO `COPY . /mxm` instead

RUN apk add --update nodejs nodejs-npm && \
    apk add --update git               && \
    npm install -g yarn                && \
    yarn global add @quasar/cli        && \
    git clone https://github.com/mbari-org/mxm.git /mxm         && \
    cd /mxm                                                     && \
    yarn                                                        && \
    export PATH="$(yarn global bin):$PATH"                      && \
    quasar ext add @mbari/qgeomap                               && \
    quasar build                                                && \
    cp -r dist/spa/*   /usr/local/apache2/htdocs/               && \
    rm -rf             /usr/local/apache2/htdocs/statics/config && \
    cp docker/htaccess /usr/local/apache2/htdocs/.htaccess
