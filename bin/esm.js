#!/usr/bin/env node

// https://github.com/standard-things/esm
require = require('esm')(module)
module.exports = require('../src/server/server.js').default
