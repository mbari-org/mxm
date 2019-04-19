#!/bin/bash

function usage() {
	echo "Usage:"
	echo "  ./dockerize.sh mxm <version>"
	echo "  ./dockerize.sh mxm-postgres <version>"
	echo
	echo "Example:"
	echo "  ./dockerize.sh mxm 0.2.1"
	echo "  ./dockerize.sh mxm-postgres 0.2.1"
	echo
	exit 1
}

what=$1
version=$2
if [ "$version" = "" ]; then
	usage
fi

if [ "$what" = "mxm" ]; then
	cd ..
	docker build -f docker/Dockerfile -t "mbari/mxm:$version" .

elif [ "$what" = "mxm-postgres" ]; then
	docker build -f Dockerfile-postgres -t "mbari/mxm-postgres:$version" .

else
	usage
fi
