import { $mxmVal } from '../mxmVal.js'
import * as fc from 'fast-check'

describe('$mxmVal', () => {
  test('is defined', () => {
    expect($mxmVal).toBeDefined()
  })

  test('isNumericType', () => {
    expect($mxmVal.isNumericType('float')).toBeTruthy()
    expect($mxmVal.isNumericType('integer')).toBeTruthy()
  })

  test('checkValue required', () => {
    const required = true
    const types = fc.oneof(fc.constant('integer'), fc.constant('float'))
    fc.assert(
      fc.property(types, simpleType => {
        const res = $mxmVal.checkValue('', simpleType, required)
        expect(res).toBe('A value is required')
      })
    )
  })

  test('checkValue integers', () => {
    const simpleType = 'integer'
    const required = true
    fc.assert(
      fc.property(fc.integer(), value => {
        const res = $mxmVal.checkValue(value+"", simpleType, required)
        expect(res).toBeUndefined()
      })
    )
  })
})
