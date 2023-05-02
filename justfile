set dotenv-load := true

# List recipes
list:
	@just --list --unsorted

# Bring in all changes in submodules
pull-submodules:
	git submodule foreach "(git checkout main; git pull origin main)"

# Show sub-module versions
versions:
	@echo "mxm-server = $(cd mxm-server && just version)"
	@echo "    mxm-ui = $(cd mxm-ui && just version)"

# Prepare for git commit and tagging, push, ...
prepare version:
	echo "export MXM_VERSION={{version}}" > .env

# TODO(lower prio) recipies to dockerize, push, etc.
# This is done via github actions.

# Full update of this repo
commit-and-push: commit-main-and-push tag-and-push

# Commit and push main branch
commit-main-and-push:
	git add -u
	git commit -m "build v${MXM_VERSION}"
	git push origin main

# Create new tag and push it
tag-and-push force='':
	git tag  {{force}} v${MXM_VERSION}
	git push {{force}} origin v${MXM_VERSION}

# Show latest few tags
tags:
	git tag -l | sort -V | tail

# ---------------------------------
# CD recipes.
# Note: CD not triggered from release workflow because there's currently
# no proxy to use our watchtower instance API from external locations.

# Trigger container update on mxm
watchtower-mxm:
  #!/bin/bash
  if [[ -f ./setenv.sh ]]; then
    source ./setenv.sh
  fi
  if [[ -z "${WATCHTOWER_HTTP_API_TOKEN}" ]]; then
    echo "Error: WATCHTOWER_HTTP_API_TOKEN not set."
  elif [[ -z "${MXM_WATCHTOWER_ENDPOINT}" ]]; then
    echo "Error: MXM_WATCHTOWER_ENDPOINT not set."
  else
    AUTH="Authorization: Bearer ${WATCHTOWER_HTTP_API_TOKEN}"
    curl -H "$AUTH" "${MXM_WATCHTOWER_ENDPOINT}"
  fi
