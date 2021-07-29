import { describe, expect, it } from '@jest/globals'
import { ConcatStreamEncoding, inferEncoding } from '../../src/utils'

describe('inferEncoding', () => {
  it('infers encoding from a string', () => {
    expect(inferEncoding('hello')).toEqual(ConcatStreamEncoding.string)
  })

  it('infers encoding from a buffer', () => {
    expect(inferEncoding(Buffer.from('hello'))).toEqual(
      ConcatStreamEncoding.buffer
    )
  })

  it('infers encoding from undefined', () => {
    expect(inferEncoding(undefined)).toEqual(ConcatStreamEncoding.buffer)
  })

  it('infers encoding from an array', () => {
    expect(inferEncoding(['hello'])).toEqual(ConcatStreamEncoding.array)
  })

  it('infers encoding from a UInt8Array', () => {
    const u8 = new Uint8Array(4)
    u8[0] = 32
    u8[1] = 99
    u8[2] = 97
    u8[3] = 116

    expect(inferEncoding(u8)).toEqual(ConcatStreamEncoding.uint8array)
  })

  it('infers encoding from an object', () => {
    expect(
      inferEncoding({
        hello: 'world'
      })
    ).toEqual(ConcatStreamEncoding.object)
  })
})
