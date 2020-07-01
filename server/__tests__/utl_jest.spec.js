import {
  cleanPath,
} from '../src/utl.js'

// const utl = require('../utl.js')
// const cleanPath = utl.cleanPath

describe('cleanPath', () => {

  test('root directory /', () => {
    expect(cleanPath('/')).toBe('/')
    expect(cleanPath('//')).toBe('/')
    expect(cleanPath('///')).toBe('/')
  })

  test('other directories', () => {
    expect(cleanPath('/aa/dir//')).toBe('/aa/dir/')
    expect(cleanPath('aa/dir/')).toBe('/aa/dir/')
    expect(cleanPath('/aa//b/c/dir//')).toBe('/aa/b/c/dir/')
    expect(cleanPath('aa/b/c///dir/')).toBe('/aa/b/c/dir/')
    expect(cleanPath('aa/b/c/dir/')).toBe('/aa/b/c/dir/')
  })

  test('files', () => {
    expect(cleanPath('//aa//b/c////foo')).toBe('/aa/b/c/foo')
    expect(cleanPath('aa//b/c//foo')).toBe('/aa/b/c/foo')
    expect(cleanPath('aa/b///c/foo')).toBe('/aa/b/c/foo')
    expect(cleanPath('aa/b/c/foo')).toBe('/aa/b/c/foo')
    expect(cleanPath('aa/foo')).toBe('/aa/foo')
    expect(cleanPath('//aa/foo')).toBe('/aa/foo')
  })
})
