import map from 'lodash/map'

export default ({ app, Vue }) => {
  Vue.prototype.$mxmVal = {
    checkValue,
    toGeojson,
    fromGeojson,
  }
}

function checkValue(value, simpleType, required) {
  value = value && value.trim() || ''
  if (value) {
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
    }
  }
  else if (required) {
    return 'A value is required'
  }
}

function checkInteger(value) {
  if (!value.match(/^-?\d+$/)) {
    return 'Invalid integer'
  }
}

function checkFloat(value) {
  if (!value.match(/^-?\d*(\.\d+)?$/)) {
    return 'Invalid float'
  }
}

function checkBoolean(value) {
  if (!value.match(/^(true|false)$/)) {
    return 'Invalid boolean'
  }
}

function checkPointString(value) {
  try {
    const array = JSON.parse(value)
    return checkPoint(array)
  }
  catch (err) {
    return err
  }
}

function checkPoint(array) {
  if (!Array.isArray(array)) {
    return 'Not an array'
  }
  if (array.length < 2 || array.length > 3) {
    return `Not an array of 2 or 3 elements`
  }
}

function checkMultiPointString(value) {
  try {
    const array = JSON.parse(value)
    return checkMultiPoint(array)
  }
  catch (err) {
    return err
  }
}

function checkMultiPoint(array) {
  console.log('checkMultiPoint', array)
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

  const json = simple && JSON.parse(simple)
  if (json) {
    switch (simpleType) {
      case 'Point': {
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

      case 'MultiPoint': {
        const coordinates = map(json, ([lat, lon]) => [lon, lat])
        return {
          type: 'Feature',
          geometry: {
            type: 'MultiPoint',
            coordinates,
          }
        }
      }

      case 'Polygon': {
        const coordinates = [ map(json, ([lat, lon]) => [lon, lat]) ]
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates,
          }
        }
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
  console.log('fromGeojson:', 'simpleType=', simpleType,
    'geometry.type=', geometry.type, 'geometry=', geometry)

  switch (geometry.type) {
    case 'Feature': {
      // TODO this is very simplistic for now (ignoring feature properties...)
      return fromGeojson(geometry.geometry)
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
      console.log('fromGeojson: FeatureCollection: geometry=', geometry)
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
        return fromGeojson(feat)
      }
    }

    case 'Polygon': {
      const [coordinates] = geometry.coordinates
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
