#!/bin/bash

function usage() {
	echo "Usage:"
	echo "  ./dockerize.sh mxms <version>"
	echo "  ./dockerize.sh mxmspostgres <version>"
	echo
	echo "Example:"
	echo "  ./dockerize.sh mxms 0.2.0"
	echo "  ./dockerize.sh mxmspostgres 0.2.0"
	echo
	exit 1
}

what=$1
version=$2
if [ "$version" = "" ]; then
	usage
fi

if [ "$what" = "mxms" ]; then
	cd ..
	docker build -f docker/Dockerfile -t "mbari/mxms:$version" --no-cache .

elif [ "$what" = "mxmspostgres" ]; then
	docker build -f Dockerfile-postgres -t "mbari/mxmspostgres:$version" --no-cache .

else
	usage
fi
