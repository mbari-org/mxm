import { boot } from 'quasar/wrappers'
import { GeoJSON } from 'geojson'

const debug = window.location.search.match(/.*debug=(-|.*\bmxmval\b).*/)

declare module '@vue/runtime-core' {
  interface MxmValProperties {
    mxmVal: any
  }
}

const mxmVal = {
  checkValue,
  toGeojson,
  fromGeojson,
  isGeojsonType,
  isNumericType,
  emptyFeature,
}

export default boot(({ app }) => {
  app.provide('mxmVal', mxmVal)
  app.config.globalProperties.mxmVal = mxmVal
})

function checkValue(
  value: string,
  valueType: string,
  required = false,
  valueCanReference = ''
) {
  value = (value && value.trim()) || ''
  if (value) {
    const err = checkValueByType(value, valueType)
    if (err) {
      if (valueCanReference) {
        switch (valueCanReference) {
          case 'anyString': {
            // check it sort of begins like a typical identifier:
            if (value.match(/^[a-zA-Z_].*/)) {
              return null // OK
            }
          }
          // TODO other cases
        }
      }
      return err
    }
  } else if (required) {
    return 'A value is required'
  }
}

function checkValueByType(value: string, valueType: string) {
  switch (valueType) {
    case 'GeoJSON': {
      return null
    }

    case 'integer': {
      return checkInteger(value)
    }

    case 'float': {
      return checkFloat(value)
    }

    case 'boolean': {
      return checkBoolean(value)
    }

    case 'Point': {
      return checkPointString(value)
    }

    case 'MultiPoint': {
      return checkMultiPointString(value)
    }

    case 'Polygon': {
      return checkPolygonString(value)
    }

    case 'LineString': {
      return checkLineStringString(value)
    }

    case 'string': {
      return null // OK
    }

    default: {
      return `unrecognized type: ${valueType}`
    }
  }
}

function checkInteger(value: string) {
  if (!value.match(/^-?\d+$/)) {
    return 'Invalid integer value'
  }
}

function checkFloat(value: string) {
  if (value.match(/^nan$/i)) {
    return
  }
  if (isNaN(+value)) {
    return 'Invalid float value'
  }
}

function checkBoolean(value: string) {
  if (!value.match(/^(true|false)$/)) {
    return 'Invalid boolean value'
  }
}

function checkPointString(value: string) {
  try {
    const array = JSON.parse(value)
    return checkPoint(array)
  } catch (err) {
    return 'Invalid Point: ' + err.message
  }
}

function checkPoint(array) {
  if (!Array.isArray(array)) {
    return 'Not an array'
  }
  if (array.length < 2 || array.length > 3) {
    return 'Not an array of 2 or 3 elements'
  }
  for (let i = 0; i < array.length; i++) {
    if (typeof array[i] !== 'number') {
      return 'Elements must be numbers'
    }
  }
}

function checkMultiPointString(value: string) {
  try {
    const array = JSON.parse(value)
    return checkMultiPoint(array)
  } catch (err) {
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

function checkPolygonString(value: string) {
  try {
    const array = JSON.parse(value)
    return checkPolygon(array)
  } catch (err) {
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

function checkLineStringString(value: string) {
  try {
    const array = JSON.parse(value)
    return checkLineString(array)
  } catch (err) {
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
function toGeojson(value: string, valueType: string): GeoJSON {
  if (debug) console.debug('toGeojson: value=', value, 'valueType=', valueType)
  // ignore given value if invalid:
  const checkResult = checkValue(value, valueType)
  if (checkResult) {
    console.warn(
      'toGeojson: invalid',
      'value=',
      value,
      'valueType=',
      valueType,
      'checkResult=',
      checkResult
    )
    return emptyFeature()
  }

  const json = value && JSON.parse(value)
  if (json) {
    switch (valueType) {
      case 'Point': {
        const [lat, lon] = json
        const coordinates = [lon, lat]
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates,
          },
        } as GeoJSON
      }

      case 'MultiPoint': {
        const coordinates = json.map(([lat, lon]) => [lon, lat])
        return {
          type: 'Feature',
          geometry: {
            type: 'MultiPoint',
            coordinates,
          },
        } as GeoJSON
      }

      case 'Polygon': {
        if (debug) console.debug('toGeojson: polygon: json=', json)
        const coordinates = [json.map(([lat, lon]) => [lon, lat])]
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates,
          },
        } as GeoJSON
      }

      case 'LineString': {
        const coordinates = json.map(([lat, lon]) => [lon, lat])
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates,
          },
        } as GeoJSON
      }

      case 'GeoJSON': {
        return json as GeoJSON
      }

      default: {
        throw new Error(`unrecognized type: ${valueType}`)
      }
    }
  } else {
    console.warn('toGeojson: could not parse value=', value)
    return emptyFeature()
  }
}

function fromGeojson(geometry: GeoJSON, valueType: string): string {
  if (!geometry || (Array.isArray(geometry) && !geometry.length)) {
    return '' // avoid returning `[]`
  }
  if (debug)
    console.log(
      'fromGeojson:',
      'valueType=',
      valueType,
      'geometry.type=',
      geometry.type,
      'geometry=',
      geometry
    )

  if (valueType === 'GeoJSON') {
    return JSON.stringify(geometry, null, '  ')
  }

  switch (geometry.type) {
    case 'Feature': {
      // TODO this is very simplistic for now (ignoring feature properties...)
      return fromGeojson(geometry.geometry, valueType)
    }

    case 'Point': {
      const coordinates = geometry.coordinates
      const [lon, lat] = coordinates
      const value = [lat, lon]
      return JSON.stringify(value)
    }

    case 'MultiPoint': {
      const coordinates = geometry.coordinates
      const value = coordinates.map(([lat, lon]) => [lon, lat])
      return JSON.stringify(value)
    }

    case 'FeatureCollection': {
      if (debug)
        console.log('fromGeojson: FeatureCollection: geometry=', geometry)
      if (!geometry.features || !geometry.features.length) {
        return ''
      } else if (valueType === 'MultiPoint') {
        const value = geometry.features.map(feature => {
          console.assert(feature.geometry.type === 'Point')
          const [lon, lat] = feature.geometry.coordinates
          return [lat, lon]
        })
        return JSON.stringify(value)
      } else {
        const feat = geometry.features[0]

        if (geometry.features.length > 1) {
          // TODO handle this case of multiple-feature collection as there's no
          //  simplified type to translate to, probably as an error condition.
          console.warn(
            'fromGeojson: FeatureCollection: only extracted first feature=',
            feat,
            'from collection of length=',
            geometry.features.length
          )
        }
        return fromGeojson(feat, valueType)
      }
    }

    case 'Polygon': {
      const [coordinates] = geometry.coordinates
      const value = coordinates.map(([lat, lon]) => [lon, lat])
      return JSON.stringify(value)
    }

    case 'LineString': {
      const coordinates = geometry.coordinates
      const value = coordinates.map(([lat, lon]) => [lon, lat])
      return JSON.stringify(value)
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
  } as GeoJSON
}

function isGeojsonType(valueType: string) {
  switch (valueType) {
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

function isNumericType(valueType: string) {
  return valueType === 'float' || valueType === 'integer'
}
