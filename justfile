set dotenv-load := true

# List recipes
list:
	@just --list --unsorted

# Prepares database and mxm server
server-prepare dbname="mxm":
	echo "export PG_DBNAME={{dbname}}" > .env
	echo "export PG_CONN_STRING=postgres://postgres@localhost:5432/{{dbname}}" >> .env

# Creates database on localhost
server-create-database:
	psql -h localhost -p 5432 -c "create database ${PG_DBNAME}"

# Populates database with some data
server-populate-database:
	psql -h localhost -p 5432 -d ${PG_DBNAME} < docker/mxm-schema.sql

# Runs the mxm server
server-run:
	#!/usr/bin/env bash
	echo "PG_CONN_STRING=${PG_CONN_STRING}"
	(cd server && bin/esm.js)

# Runs the webapp
webapp-run:
	#!/usr/bin/env bash
	(cd webapp && quasar dev --modern)
