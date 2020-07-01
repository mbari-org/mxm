import map from 'lodash/map'

const $mxmVal = {
  checkValue,
  toGeojson,
  fromGeojson,
  isGeojsonType,
  isNumericType,
  emptyFeature,
}

export { $mxmVal }

export default ({ app, Vue }) => {
  Vue.prototype.$mxmVal = $mxmVal
}

const debug = window.location.search.match(/.*debug=.*mxmval.*/)

function checkValue(value, simpleType, required, valueCanReference) {
  value = value && value.trim() || ''
  if (value) {
    let err = checkValueByType(value, simpleType)
    if (err) {
      if (valueCanReference) {
        switch (valueCanReference) {
          case 'anyString': {
            // check it sort of begins like a typical identifier:
            if (value.match(/^[a-zA-Z_].*/)) {
              return null  // OK
            }
          }
          // TODO other cases
        }
      }
      return err
    }
  }
  else if (required) {
    return 'A value is required'
  }
}

function checkValueByType(value, simpleType) {
  const lcType = simpleType.toLowerCase()
  switch (lcType) {
    case 'integer': {
      return checkInteger(value)
    }

    case 'float': {
      return checkFloat(value)
    }

    case 'boolean': {
      return checkBoolean(value)
    }

    case 'point': {
      return checkPointString(value)
    }

    case 'multipoint': {
      return checkMultiPointString(value)
    }

    case 'polygon': {
      return checkPolygonString(value)
    }

    case 'linestring': {
      return checkLineStringString(value)
    }

    case 'string': {
      return null  // OK
    }

    default: {
      return `unrecognized type: ${simpleType}`
    }
  }
}

function checkInteger(value) {
  if (!value.match(/^-?\d+$/)) {
    return 'Invalid integer value'
  }
}

function checkFloat(value) {
  if (value.match(/^nan$/i)) {
    return
  }
  if (+value === NaN) {
    return 'Invalid float value'
  }
}

function checkBoolean(value) {
  if (!value.match(/^(true|false)$/)) {
    return 'Invalid boolean value'
  }
}

function checkPointString(value) {
  try {
    const array = JSON.parse(value)
    return checkPoint(array)
  }
  catch (err) {
    return 'Invalid Point: ' + err.message
  }
}

function checkPoint(array) {
  if (!Array.isArray(array)) {
    return 'Not an array'
  }
  if (array.length < 2 || array.length > 3) {
    return `Not an array of 2 or 3 elements`
  }
  for (let i = 0; i < array.length; i++) {
    if (typeof array[i] !== 'number') {
      return `Elements must be numbers`
    }
  }
}

function checkMultiPointString(value) {
  try {
    const array = JSON.parse(value)
    return checkMultiPoint(array)
  }
  catch (err) {
    return 'Invalid MultiPoint: ' + err.message
  }
}

function checkMultiPoint(array) {
  // console.log('checkMultiPoint', array)
  if (!Array.isArray(array)) {
    return 'Not an array'
  }
  for (let i = 0; i < array.length; i++) {
    const err = checkPoint(array[i])
    if (err) {
      return `${i}-th element not an point`
    }
  }
}

function checkPolygonString(value) {
  try {
    const array = JSON.parse(value)
    return checkPolygon(array)
  }
  catch (err) {
    return 'Invalid Polygon: ' + err.message
  }
}

function checkPolygon(array) {
  // console.log('checkPolygon', array)
  if (!Array.isArray(array)) {
    return 'Not an array'
  }
  if (array.length < 3) {
    return 'At least 3 points for a polygon'
  }
  for (let i = 0; i < array.length; i++) {
    const err = checkPoint(array[i])
    if (err) {
      return `${i}-th element not an point`
    }
  }
}

function checkLineStringString(value) {
  try {
    const array = JSON.parse(value)
    return checkLineString(array)
  }
  catch (err) {
    return 'Invalid LineString: ' + err.message
  }
}

function checkLineString(array) {
  // console.log('checkLineString', array)
  if (!Array.isArray(array)) {
    return 'Not an array'
  }
  for (let i = 0; i < array.length; i++) {
    const err = checkPoint(array[i])
    if (err) {
      return `${i}-th element not an point`
    }
  }
}

// TODO all of this preliminary
function toGeojson(simpleType, simple) {
  // ignore given value if invalid:
  if (checkValue(simple, simpleType)) {
    return emptyFeature()
  }

  const lcType = simpleType.toLowerCase()

  const json = simple && JSON.parse(simple)
  if (json) {
    switch (lcType) {
      case 'point': {
        const [lat, lon] = json
        const coordinates = [lon, lat]
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates,
          }
        }
      }

      case 'multipoint': {
        const coordinates = map(json, ([lat, lon]) => [lon, lat])
        return {
          type: 'Feature',
          geometry: {
            type: 'MultiPoint',
            coordinates,
          }
        }
      }

      case 'polygon': {
        const coordinates = [ map(json, ([lat, lon]) => [lon, lat]) ]
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates,
          }
        }
      }

      case 'linestring': {
        const coordinates = map(json, ([lat, lon]) => [lon, lat])
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates,
          }
        }
      }

      default: {
        return `unrecognized type: ${simpleType}`
      }
    }
  }
  else {
    return emptyFeature()
  }
}

function fromGeojson(simpleType, geometry) {
  if (!geometry || Array.isArray(geometry) && !geometry.length) {
    return ''   // avoid returning `[]`
  }
  if (debug) console.log('fromGeojson:', 'simpleType=', simpleType,
    'geometry.type=', geometry.type, 'geometry=', geometry)

  switch (geometry.type) {
    case 'Feature': {
      // TODO this is very simplistic for now (ignoring feature properties...)
      return fromGeojson(simpleType, geometry.geometry)
    }

    case 'Point': {
      const coordinates = geometry.coordinates
      const [lon, lat] = coordinates
      const simple = [lat, lon]
      return JSON.stringify(simple)
    }

    case 'MultiPoint': {
      const coordinates = geometry.coordinates
      const simple = map(coordinates, ([lat, lon]) => [lon, lat])
      return JSON.stringify(simple)
    }

    case 'FeatureCollection': {
      if (debug) console.log('fromGeojson: FeatureCollection: geometry=', geometry)
      if (!geometry.features || !geometry.features.length) {
        return ''
      }
      else if (simpleType === 'MultiPoint') {
        const simple = map(geometry.features, feature => {
          console.assert(feature.geometry.type === 'Point')
          const [lon, lat] = feature.geometry.coordinates
          return [lat, lon]
        })
        return JSON.stringify(simple)
      }
      else {
        const feat = geometry.features[0]
        console.warn('fromGeojson: FeatureCollection: handling first feature!=', feat)
        return fromGeojson(simpleType, feat)
      }
    }

    case 'Polygon': {
      const [coordinates] = geometry.coordinates
      const simple = map(coordinates, ([lat, lon]) => [lon, lat])
      return JSON.stringify(simple)
    }

    case 'LineString': {
      const coordinates = geometry.coordinates
      const simple = map(coordinates, ([lat, lon]) => [lon, lat])
      return JSON.stringify(simple)
    }

    // TODO revisit the 'toFixed" simplification
    default:
      return JSON.stringify(geometry, (k, v) =>
        typeof v === 'number' && v.toFixed ? +v.toFixed(6) : v
      )
  }
}

function emptyFeature() {
  return {
    type: 'FeatureCollection',
    features: [],
  }
}

function isGeojsonType(simpleType) {
  switch (simpleType) {
    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
    case 'GeometryCollection':
    // https://tools.ietf.org/html/rfc7946#section-3
    case 'GeoJSON':
      return true

    // https://tools.ietf.org/html/rfc7946#section-3.2
    case 'Feature':
    case 'FeatureCollection':
      return true

    default:
      return false
  }
}

function isNumericType(simpleType) {
  return simpleType === 'float' || simpleType === 'integer'
}
