FROM httpd:2.4.35-alpine

LABEL maintainer="carueda@mbari.org"

COPY dist/spa/       /usr/local/apache2/htdocs/
RUN  rm -rf          /usr/local/apache2/htdocs/statics/config
COPY docker/htaccess /usr/local/apache2/htdocs/.htaccess
