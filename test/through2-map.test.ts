import { describe, it, expect, jest } from '@jest/globals'
import { Readable } from 'stream'
import { ChunkHandler, ctor, make, obj, Through2Map } from '../src/map'
import {
  objectStreamToArray,
  streamToArray,
  writeArrayToStream
} from './helpers'

/**
 *
 * @param {string} str A string
 * @param {number} _  index
 * @returns {string} uppercased string
 */
function shout(str: string, _: number): string {
  return str.toUpperCase()
}

/**
 * @param {Record<string, string>} obj An object
 * @param {number} _ index
 * @returns {Record<string, string>} Object with keys and values transformed to uppercase
 */
function objShout(
  obj: Record<string, string>,
  _: number
): Record<string, string> {
  const result: Record<string, string> = {}
  const entries = Object.entries(obj)
  for (const [key, value] of entries) {
    result[key.toUpperCase()] = value.toUpperCase()
  }

  return result
}

/**
 * @param {any} _1 A value
 * @param {number} _2 Index
 * @throws Error
 */
function yell(_1: unknown, _2: number): unknown {
  throw new Error('yell')
}

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

  it('creates a TransformStream that converts strings to uppercase', async () => {
    const stream = make(shout as ChunkHandler<string>, { wantsStrings: true })
    stream.write('dog')
    stream.write('cat')
    stream.end('mouse')

    const [actual] = await streamToArray(stream)
    expect(actual).toEqual('DOGCATMOUSE')
  })

  it('creates a TransformStream that converts object keys to uppercase', async () => {
    const stream = obj(objShout as ChunkHandler<Record<string, string>>)
    writeArrayToStream(
      [
        {
          lorem: 'ipsum',
          foo: 'bar'
        },
        {
          lorem: 'gyspum',
          foo: 'baz'
        }
      ],
      stream
    )
    stream.end()

    const actual = await objectStreamToArray(stream)
    expect(actual).toEqual([
      {
        LOREM: 'IPSUM',
        FOO: 'BAR'
      },
      {
        LOREM: 'GYSPUM',
        FOO: 'BAZ'
      }
    ])
  })

  it('passes the error to the event', (done) => {
    const stream = make(yell as ChunkHandler<unknown>)

    const mockErrorHandler = jest.fn()
    stream.on('error', (error) => {
      mockErrorHandler(error)
    })

    stream.on('close', () => {
      expect(mockErrorHandler).toBeCalledWith(new Error('yell'))
      done()
    })

    stream.write('more shouting')
    stream.end()
  })
})
