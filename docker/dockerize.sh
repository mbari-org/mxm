#!/bin/bash

function usage() {
	echo "Usage:"
	echo "  ./dockerize.sh pxs-ui <version>"
	echo "  ./dockerize.sh pxspostgres <version>"
	echo
	echo "Example:"
	echo "  ./dockerize.sh pxs-ui 0.0.1"
	echo "  ./dockerize.sh pxspostgres 0.0.1"
	echo
	exit 1
}

what=$1
version=$2
if [ "$version" = "" ]; then
	usage
fi

if [ "$what" = "pxs-ui" ]; then
	cd ..
	docker build -f docker/Dockerfile -t "mbari/pxs-ui:$version" --no-cache .

elif [ "$what" = "pxspostgres" ]; then
	docker build -f Dockerfile-postgres -t "mbari/pxspostgres:$version" --no-cache .

else
	usage
fi