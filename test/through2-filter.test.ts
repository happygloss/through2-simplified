import { describe, expect, it } from '@jest/globals'
import { Readable } from 'stream'
import Through2Filter, { ctor, make, obj, Predicate } from '../src/filter'
import { Options } from '../src/map'
import { spigot } from '../src/spigot'
import {
  streamToArray,
  objectStreamToArray,
  createSourceWithData
} from './helpers'

/**
 * @description Only allows strings of length 3
 * @param {string} chunk Any string
 * @param {number} _ index
 * @returns {boolean} true if chunk is of length 3
 */
function onlyLengthOfThree(chunk: string, _: number): boolean {
  return chunk.length === 3
}

/**
 * @param {any} _1 A value
 * @param {number} _2 Index
 * @throws Error
 */
function yell(_1: unknown, _2: number): unknown {
  throw new Error('yell')
}

interface SkipOnRequest {
  foo: string
  skip?: boolean
}

/**
 * @param {SkipOnRequest} chunk an object with skip value.
 * @param {number} _ index
 * @returns {boolean} should chunk be skipped
 */
function skipOnRequest(chunk: SkipOnRequest, _: number): boolean {
  return chunk.skip == null || !chunk.skip
}

describe('filter', () => {
  it('PassThrough', async () => {
    const readable = new Readable()
    const stream = new Through2Filter()
    readable.push('foo')
    readable.push(null)

    readable.pipe(stream)

    const [actual] = await streamToArray(stream)
    expect(actual).toEqual('foo')
  })

  it('make: PassThrough', async () => {
    const readable = new Readable()
    const stream = make()
    readable.push('foo')
    readable.push(null)

    readable.pipe(stream)

    const [actual] = await streamToArray(stream)
    expect(actual).toEqual('foo')
  })

  it('obj: noop aka PassThrough', async () => {
    const readable = new Readable({ objectMode: true })
    readable.push({ foo: 'bar' })
    readable.push(null)

    const stream = obj()
    readable.pipe(stream)

    const [actual] = await objectStreamToArray(stream)
    expect(actual).toEqual({ foo: 'bar' })
  })

  it('ctor: PassThrough', async () => {
    const readable = new Readable()
    readable.push('foo')
    readable.push(null)

    const NoopFilter = ctor('NoopFilter')
    const stream = new NoopFilter()

    readable.pipe(stream)
    const [actual] = await streamToArray(stream)
    expect(actual).toEqual('foo')
  })

  it('creates a Transform stream that drops any chunks not of length 3', async () => {
    const readable = new Readable()
    readable.push('dark')
    readable.push('hero')
    readable.push('core')
    readable.push('four')

    readable.push('foo')
    readable.push('bar')
    readable.push('two')

    readable.push(null)

    const options: Options = { wantsStrings: false }
    const stream = make(onlyLengthOfThree as Predicate, options)
    readable.pipe(stream)

    const [actual] = await streamToArray(stream)
    expect(actual).toEqual('foobartwo')
  })

  it('reads from a spigot stream and filters any strings that dont have a length of 3', async () => {
    const source = spigot(['dark', 'hero', 'core', 'four', 'foo', 'bar', 'two'])
    const sink = make(onlyLengthOfThree as Predicate, {
      wantsStrings: true
    })

    source.pipe(sink)

    const actual = await streamToArray(sink)
    expect(actual).toEqual(['foo', 'bar', 'two'])
  })

  it('creates a Transform stream that only skips chunks with skip: true', async () => {
    const data: SkipOnRequest[] = [
      { foo: 'bar' },
      { foo: 'baz', skip: true },
      { foo: 'bif', skip: true },
      { foo: 'clrf', skip: false },
      { foo: 'blah' },
      { foo: 'buzz' }
    ]

    const expected = [
      { foo: 'bar' },
      { foo: 'clrf', skip: false },
      { foo: 'blah' },
      { foo: 'buzz' }
    ]

    const source = createSourceWithData(data, true)

    const stream = obj(skipOnRequest as unknown as Predicate)
    source.pipe(stream)

    const actual = await objectStreamToArray(stream)
    expect(actual).toEqual(expected)
  })

  it('passes the error to the event', (done) => {
    const stream = make(yell as Predicate, {
      wantsStrings: false
    })

    stream.on('error', (error) => {
      expect(error.message).toEqual('yell')
      done()
    })

    stream.write('more shouting')
    stream.end()
  })
})
