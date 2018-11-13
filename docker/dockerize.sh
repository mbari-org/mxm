#!/bin/bash

function usage() {
	echo "Usage:"
	echo "  ./dockerize.sh pxs <version>"
	echo "  ./dockerize.sh pxspostgres <version>"
	echo
	echo "Example:"
	echo "  ./dockerize.sh pxs 0.0.1"
	echo "  ./dockerize.sh pxspostgres 0.0.1"
	echo
	exit 1
}

what=$1
version=$2
if [ "$version" = "" ]; then
	usage
fi

if [ "$what" = "pxs" ]; then
	cd ..
	docker build -f docker/Dockerfile -t "mbari/pxs:$version" --no-cache .

elif [ "$what" = "pxspostgres" ]; then
	docker build -f Dockerfile-postgres -t "mbari/pxspostgres:$version" --no-cache .

else
	usage
fi
