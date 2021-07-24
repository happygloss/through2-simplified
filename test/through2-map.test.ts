import { describe, expect, it, jest } from '@jest/globals'
import { Readable } from 'stream'
import { ChunkHandler, ctor, make, obj, Through2Map } from '../src/map'
import spigot from '../src/spigot'
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

/**
 * @description Doubles the number
 * @param {Buffer} chunk A chunk
 * @param {number} _ index
 * @returns {string} Doubles the number and converts it to a string
 */
function double(chunk: Buffer, _: number): string {
  const str = chunk.toString()
  const num = Number.parseInt(str)
  return `${num * 2}`
}

describe('Through2Map', () => {
  it('noop aka PassThrough', async () => {
    const readable = new Readable()
    readable.push('foo')
    readable.push(null)

    const stream: Through2Map = new Through2Map()
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
    const stream = make(shout as ChunkHandler, { wantsStrings: true })
    stream.write('dog')
    stream.write('cat')
    stream.end('mouse')

    const [actual] = await streamToArray(stream)
    expect(actual).toEqual('DOGCATMOUSE')
  })

  it('creates a TransformStream that converts object keys to uppercase', async () => {
    const stream = obj(objShout as ChunkHandler)
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
    const stream = make(yell as ChunkHandler, {
      wantsStrings: false
    })

    stream.on('error', (error) => {
      expect(error.message).toEqual('yell')
      done()
    })

    stream.write('more shouting')
    stream.end()
  })

  it('reads from spigot and maps the array of data', async () => {
    jest.useFakeTimers('legacy')

    const source = spigot(['1', '2', '3', '4', '5'])
    const stream = make(double as ChunkHandler)

    source.pipe(stream)
    jest.runAllImmediates()

    const actual = await streamToArray(stream)
    jest.useRealTimers()

    expect(actual).toEqual(['2', '4', '6', '8', '10'])
  })
})
