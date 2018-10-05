#!/bin/bash

function usage() {
	echo "Usage:"
	echo "  ./dockerize.sh pxspostgres <version>"
	echo
	echo "Example:"
	echo "  ./dockerize.sh pxspostgres 0.0.1"
	echo
	exit 1
}

what=$1
version=$2
if [ "$version" = "" ]; then
	usage
fi

if [ "$what" = "pxspostgres" ]; then
	docker build -f Dockerfile-postgres -t "mbari/pxspostgres:$version" --no-cache .

else
	usage
fi
