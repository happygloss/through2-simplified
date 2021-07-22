import { describe, it, expect } from '@jest/globals'
import { Readable } from 'stream'
import { ctor, make, obj, Through2Map } from '../src/map'
import { objectStreamToArray, streamToArray } from './helpers'

// function shout(str: string) {
//   return str.toUpperCase()
// }

describe('Through2Map', () => {
  it('noop aka PassThrough', async () => {
    const readable = new Readable()
    readable.push('foo')
    readable.push(null)

    const stream: Through2Map<string> = new Through2Map()
    stream.options.wantsStrings = true

    readable.pipe(stream)

    const [actual] = await streamToArray(stream)
    expect(actual).toEqual('foo')
  })

  it('noop aka PassThrough using make', async () => {
    const readable = new Readable()
    readable.push('foo')
    readable.push(null)

    const stream = make()
    readable.pipe(stream)
    const [actual] = await streamToArray(stream)
    expect(actual).toEqual('foo')
  })

  it('noop aka PassThrough using obj', async () => {
    const readable = new Readable({ objectMode: true })
    readable.push({ foo: 'bar' })
    readable.push(null)

    const stream = obj()
    readable.pipe(stream)

    const [actual] = await objectStreamToArray(stream)
    expect(actual).toEqual({ foo: 'bar' })
  })

  it('noop sub-class', async () => {
    const readable = new Readable()
    readable.push('foo')
    readable.push(null)

    const NoopMap = ctor('NoopMap')
    const stream = new NoopMap()

    readable.pipe(stream)
    const [actual] = await streamToArray(stream)
    expect(actual).toEqual('foo')
  })
})
