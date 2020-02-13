export {
  cleanPath,
}

/**
 * Cleans a directory or file path string so:
 * - single leading slash always
 * - no consecutive slashes.
 */
function cleanPath(filePath) {
  // no consecutive //
  filePath = filePath.replace(/\/\/+/g, '/')

  // leave only one leading /
  filePath = '/' + filePath.replace(/^\/+/, '')

  return filePath
}
