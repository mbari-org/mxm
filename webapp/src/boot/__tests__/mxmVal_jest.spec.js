import { $mxmVal } from '../mxmVal.js'
import * as fc from 'fast-check'

describe('$mxmVal', () => {
  const numericTypes = fc.oneof(
    fc.constant('integer'),
    fc.constant('float')
  )

  const lats = fc.float(-90, +90)
  const lons = fc.float(-180, +180)

  // generate geometries in "simple" format:
  const simple = (() => {
    const stringify = a => `[${a.join(', ')}]`

    const points = fc.tuple(lats, lons).map(stringify)

    const multipoints = fc.array(points, 1, 20).map(stringify)

    const polygons = fc.array(points, 3, 20).map(stringify)

    const linestrings = fc.array(points, 1, 20).map(stringify)

    return {
      points,
      multipoints,
      polygons,
      linestrings,
    }
  })()

  // generate geometries in "GeoJSON" format:
  const geojson = (() => {
    const positions = fc.tuple(lats, lons).map(([lat, lon]) => [lon, lat])

    const points = positions.map(position => ({
      "type": "Point",
      "coordinates": position
    }))

    const multipoints = fc.array(positions, 1, 20).map(coordinates => ({
      "type": "MultiPoint",
      "coordinates": coordinates
    }))

    const polygons = fc.array(positions, 3, 20).map(coordinates => ({
      "type": "Polygon",
      "coordinates": [ coordinates ]
    }))

    const linestrings = fc.array(positions, 1, 20).map(coordinates => ({
      "type": "LineString",
      "coordinates": coordinates
    }))

    return {
      points,
      multipoints,
      polygons,
      linestrings,
    }
  })()

  // tests:

  test('isNumericType', () => {
    fc.assert(
      fc.property(numericTypes, simpleType => {
        expect($mxmVal.isNumericType(simpleType)).toBeTruthy()
      })
    )
  })

  test('checkValue required', () => {
    const required = true
    fc.assert(
      fc.property(numericTypes, simpleType => {
        const res = $mxmVal.checkValue('', simpleType, required)
        expect(res).toBe('A value is required')
      })
    )
  })

  test('checkValue integers ok', () => {
    fc.assert(
      fc.property(fc.integer(), val => {
        const value = val.toString()
        const res = $mxmVal.checkValue(value, 'integer')
        expect(res).toBeUndefined()
      })
    )
  })

  test('checkValue invalid integers with floats', () => {
    fc.assert(
      fc.property(fc.float(), val => {
        const value = val.toString()
        fc.pre(value.includes('.'))
        const res = $mxmVal.checkValue(value, 'integer')
        expect(res.startsWith('Invalid integer value')).toBeTruthy()
      })
    )
  })

  test('checkValue floats ok', () => {
    fc.assert(
      fc.property(fc.float(), val => {
        const value = val.toString()
        const res = $mxmVal.checkValue(value, 'float')
        expect(res).toBeUndefined()
      }),

      fc.property(fc.mixedCase(fc.string('nan')), nanValue => {
        expect($mxmVal.checkValue(nanValue, 'float')).toBeUndefined()
      })
    )
  })

  test('checkValue booleans ok', () => {
    fc.assert(
      fc.property(fc.boolean(), boolVal => {
        const value = boolVal.toString()
        const res = $mxmVal.checkValue(value, 'boolean')
        expect(res).toBeUndefined()
      }),
    )
  })

  test('checkValue points ok', () => {
    fc.assert(
      fc.property(simple.points, value => {
        const res = $mxmVal.checkValue(value, 'point')
        expect(res).toBeUndefined()
      })
    )
  })

  test('checkValue points bad', () => {
    const required = true
    const a = ['', 'x', '[]', '[1, z]']
    a.forEach(value => {
      const res = $mxmVal.checkValue(value, 'point', required)
      expect(res).toBeDefined()
    })
  })

  test('checkValue multipoints ok', () => {
    fc.assert(
      fc.property(simple.multipoints, value => {
        const res = $mxmVal.checkValue(value, 'multipoint')
        expect(res).toBeUndefined()
      })
    )
    // empty array also OK:
    const res = $mxmVal.checkValue('[]', 'multipoint')
    expect(res).toBeUndefined()
  })

  test('checkValue multipoints bad', () => {``
    const required = true
    const a = ['', 'x', '[1, z]']
    a.forEach(value => {
      const res = $mxmVal.checkValue(value, 'multipoint', required)
      expect(res).toBeDefined()
    })
  })

  test('checkValue linestrings ok', () => {
    fc.assert(
      fc.property(simple.linestrings, value => {
        const res = $mxmVal.checkValue(value, 'linestring')
        expect(res).toBeUndefined()
      })
    )
    // empty array also OK:
    const res = $mxmVal.checkValue('[]', 'linestring')
    expect(res).toBeUndefined()
  })

  test('checkValue linestrings bad', () => {
    const required = true
    const a = ['', 'x', '[1, z]']
    a.forEach(value => {
      const res = $mxmVal.checkValue(value, 'linestring', required)
      expect(res).toBeDefined()
    })
  })

  test('checkValue polygons ok', () => {
    fc.assert(
      fc.property(simple.polygons, value => {
        const res = $mxmVal.checkValue(value, 'polygon')
        expect(res).toBeUndefined()
      })
    )
  })

  test('checkValue polygons bad', () => {``
    // at least 3 points
    const a = ['[]', '[[1,2], [3,4]]']
    a.forEach(value => {
      const res = $mxmVal.checkValue(value, 'polygon')
      expect(res).toBeDefined()
    })
  })

  test('checkValue toGeojson points ok', () => {
    fc.assert(
      fc.property(simple.points, value => {
        const res = $mxmVal.toGeojson('point', value)
        expect(res).toMatchSnapshot()
      }),
      {
        seed: 12121,
        endOnFailure: true,
      }
    )
  })

  test('checkValue toGeojson multipoints ok', () => {
    fc.assert(
      fc.property(simple.multipoints, value => {
        const res = $mxmVal.toGeojson('multipoint', value)
        expect(res).toMatchSnapshot()
      }),
      {
        seed: 12121,
        endOnFailure: true,
      }
    )
  })

  test('checkValue toGeojson linestrings ok', () => {
    fc.assert(
      fc.property(simple.linestrings, value => {
        const res = $mxmVal.toGeojson('linestring', value)
        expect(res).toMatchSnapshot()
      }),
      {
        seed: 12121,
        endOnFailure: true,
      }
    )
  })

  test('checkValue toGeojson polygons ok', () => {
    fc.assert(
      fc.property(simple.polygons, value => {
        const res = $mxmVal.toGeojson('polygon', value)
        expect(res).toMatchSnapshot()
      }),
      {
        seed: 12121,
        endOnFailure: true,
      }
    )
  })

  test('checkValue fromGeojson "empty" ok', () => {
    const a = [null, [], $mxmVal.emptyFeature()]
    a.forEach(geometry => {
      const res = $mxmVal.fromGeojson('polygon', geometry)
      expect(res).toBe('')
    })
  })

  test('checkValue fromGeojson points ok', () => {
    // const someGeometries = fc.sample(geojson.points, 2)
    // someGeometries.forEach(geometry => {
    //   console.warn('geojson:', geometry)
    //   console.warn('simple:', $mxmVal.fromGeojson('point', geometry))
    // })

    fc.assert(
      fc.property(geojson.points, value => {
        const res = $mxmVal.fromGeojson('point', value)
        expect(res).toMatchSnapshot()
      }),
      {
        seed: 12121,
        endOnFailure: true,
      }
    )
  })

  test('checkValue fromGeojson multipoints ok', () => {
    // const someGeometries = fc.sample(geojson.multipoints, 2)
    // someGeometries.forEach(geometry => {
    //   console.warn('geojson:', geometry)
    //   console.warn('simple:', $mxmVal.fromGeojson('multipoint', geometry))
    // })

    fc.assert(
      fc.property(geojson.multipoints, value => {
        const res = $mxmVal.fromGeojson('multipoint', value)
        expect(res).toMatchSnapshot()
      }),
      {
        seed: 12121,
        endOnFailure: true,
      }
    )
  })

  test('checkValue fromGeojson polygons ok', () => {
    // const someGeometries = fc.sample(geojson.polygons, 2)
    // someGeometries.forEach(geometry => {
    //   console.warn('geojson:', geometry)
    //   console.warn('simple:', $mxmVal.fromGeojson('polygon', geometry))
    // })

    fc.assert(
      fc.property(geojson.polygons, value => {
        const res = $mxmVal.fromGeojson('polygon', value)
        expect(res).toMatchSnapshot()
      }),
      {
        seed: 12121,
        endOnFailure: true,
      }
    )
  })

  test('checkValue fromGeojson linestrings ok', () => {
    // const someGeometries = fc.sample(geojson.linestrings, 2)
    // someGeometries.forEach(geometry => {
    //   console.warn('geojson:', geometry)
    //   console.warn('simple:', $mxmVal.fromGeojson('linestring', geometry))
    // })

    fc.assert(
      fc.property(geojson.linestrings, value => {
        const res = $mxmVal.fromGeojson('linestring', value)
        expect(res).toMatchSnapshot()
      }),
      {
        seed: 12121,
        endOnFailure: true,
      }
    )
  })
})
