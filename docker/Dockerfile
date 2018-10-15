FROM httpd:2.4.35-alpine

LABEL maintainer="carueda@mbari.org"

COPY dist/spa-mat/ /usr/local/apache2/htdocs/
COPY docker/htaccess /usr/local/apache2/htdocs/.htaccess
