import { describe, expect, it } from '@jest/globals'
import {
  canBeConvertedToBuffer,
  convertArrayToBuffer,
  convertBufferToUint8Array,
  isUTF8,
  stringConcat,
  u8Concat
} from '../../src/utils/concat-chunks'

describe('isUtf8', () => {
  it('confirms that an array of bytes is utf-8', () => {
    expect(isUTF8([115, 116, 114, 105, 110, 103, 121])).toEqual(true)
  })

  it('refutes that an array of bytes is utf-8', () => {
    const bytes = new Uint8Array([0xc0, 0x90, 0x80, 0x01])
    expect(isUTF8(bytes as unknown as number[])).toEqual(false)
  })
})

describe('canBeConvertedToBuffer', () => {
  it('confirms that a Buffer can be converted to Buffer', () => {
    expect(canBeConvertedToBuffer(Buffer.from('foo-bar'))).toEqual(true)
  })

  it('confirms that a String can be converted to Buffer', () => {
    expect(canBeConvertedToBuffer('foo-bar')).toEqual(true)
  })

  it('confirms that an array of bytes that represent a string can be converted to Buffer', () => {
    expect(canBeConvertedToBuffer([115, 116, 114, 105, 110, 103, 121])).toEqual(
      true
    )
  })

  it('confirms that a UInt8Array can be converted to buffer', () => {
    const bytes = new Uint8Array([0xc0, 0x90, 0x80, 0x01])

    expect(canBeConvertedToBuffer(bytes)).toEqual(true)
  })

  it('refutes the possibility of converting an object or an array of objects to a Buffer', () => {
    const arr = [{ foo: 'bar' }]
    expect(canBeConvertedToBuffer(arr[0])).toEqual(false)
    expect(canBeConvertedToBuffer(arr)).toEqual(false)
  })
})

describe('stringConcat', () => {
  it('converts an Array of strings to a Buffer and concats them', () => {
    expect(stringConcat(['foo', 'bar', Buffer.from('baz')])).toEqual(
      'foobarbaz'
    )
  })
})

describe('convertArrayToBuffer', () => {
  it('concats an array of strings to Buffer', () => {
    expect(convertArrayToBuffer(['foo', 'bar', 'baz'])).toEqual(
      Buffer.from('foobarbaz')
    )
  })

  it('concats an array of bytes to a Buffer', () => {
    const bytes = [115, 116, 114, 105, 110, 103, 121]
    expect(convertArrayToBuffer(bytes)).toEqual(Buffer.from(bytes))
  })
})

describe('convertBufferToUint8Array', () => {
  it('converts a buffer to uint8array', () => {
    const buffer = Buffer.from('hello')
    expect(convertBufferToUint8Array(buffer)).toEqual(
      new Uint8Array([104, 101, 108, 108, 111])
    )
  })
})

describe('u8Concat', () => {
  it('concats two UInt8Arrays', () => {
    const smelly = new Uint8Array([115, 109, 101, 108, 108, 121, 32])
    const cat = new Uint8Array([99, 97, 116])

    expect(u8Concat([smelly, cat])).toEqual(
      new Uint8Array([115, 109, 101, 108, 108, 121, 32, 99, 97, 116])
    )
  })
})
