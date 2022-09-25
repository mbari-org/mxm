set dotenv-load := true

# List recipes
list:
	@just --list --unsorted

# Bring in all changes in submodules
pull-submodules:
	git submodule foreach "(git checkout main; git pull origin main)"

# Show sub-module versions
versions:
	head -n4 mxm-ui/package.json mxm-server/src/main/resources/application.properties

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
tag-and-push:
	git tag v${MXM_VERSION}
	git push origin v${MXM_VERSION}

# Show latest few tags
tags:
	git tag -l | sort -V | tail
