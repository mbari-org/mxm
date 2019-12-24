import { $mxmVal } from '../mxmVal.js'
import * as fc from 'fast-check'

describe('$mxmVal', () => {
  const numericTypes = fc.oneof(
    fc.constant('integer'),
    fc.constant('float')
  )

  const boolValues = fc.oneof(
    fc.constant('true'),
    fc.constant('false')
  )

  const lats = fc.float(-90, +90)
  const lons = fc.float(-180, +180)

  const points = fc.tuple(lats, lons)
    .map(a => `[${a.join(', ')}]`)

  const multipoints = fc.array(points, 1, 20)
    .map(a => `[${a.join(', ')}]`)

  const polygons = fc.array(points, 3, 20)
    .map(a => `[${a.join(', ')}]`)

  const linestrings = fc.array(points, 1, 20)
    .map(a => `[${a.join(', ')}]`)


  test('is defined', () => {
    expect($mxmVal).toBeDefined()
  })

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

  test('checkValue integers with floats', () => {
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
      fc.property(boolValues, value => {
        const res = $mxmVal.checkValue(value, 'boolean')
        expect(res).toBeUndefined()
      }),
    )
  })

  test('checkValue points ok', () => {
    fc.assert(
      fc.property(points, value => {
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
      fc.property(multipoints, value => {
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
      fc.property(linestrings, value => {
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
      fc.property(polygons, value => {
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
      fc.property(points, value => {
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
      fc.property(multipoints, value => {
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
      fc.property(linestrings, value => {
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
      fc.property(polygons, value => {
        const res = $mxmVal.toGeojson('polygon', value)
        expect(res).toMatchSnapshot()
      }),
      {
        seed: 12121,
        endOnFailure: true,
      }
    )
  })
})
