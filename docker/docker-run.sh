#! /bin/bash

# just for quick test

docker run -p 8080:8080 \
       hasura/graphql-engine:v1.0.0-alpha22 \
       graphql-engine \
       --database-url postgresql://host.docker.internal:5432/pxs \
       serve --enable-console
