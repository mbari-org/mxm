set dotenv-load := true

# Just a few devel convenient recipes.
# More complete in parent 'mxm' and via github actions.

# List recipes
list:
	@just --list --unsorted

# quasar dev
dev:
	quasar dev

# Format code
format:
	yarn run format

format-check:
	yarn run format-check

# Run tests
test:
	yarn run test:unit

# Show version
version:
	@head -n 5 package.json | rg '"version": "([^"]*)"' -r '$1'
