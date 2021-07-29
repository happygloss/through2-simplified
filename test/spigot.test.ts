import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest
} from '@jest/globals'
import { PassThrough } from 'stream'
import Spigot, { spigot } from '../src/spigot'
import { objectStreamToArray, streamToArray } from './helpers'

describe('Spigot', () => {
  beforeEach(() => {
    jest.useFakeTimers('legacy')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('allows consumers to read a string', async () => {
    const data = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const source = spigot([data])

    const sink = new PassThrough()
    source.pipe(sink)

    jest.runAllImmediates()

    const actual = await streamToArray(sink)
    expect(actual).toEqual([data])
  })

  it('makes an array of data available to consumers', async () => {
    const source = new Spigot(['A', 'B', 'C'])
    expect(source.getData()).toEqual(['A', 'B', 'C'])
    const sink = new PassThrough()
    source.pipe(sink)

    jest.runAllImmediates()
    const actual = await streamToArray(sink)
    expect(actual).toEqual(['A', 'B', 'C'])
  })

  it('makes an array of data available to consumers', async () => {
    const data = ['A', 'B', 'C']
    const source = new Spigot()
    source.setData(data)

    const sink = new PassThrough()
    source.pipe(sink)

    jest.runAllImmediates()
    const actual = await streamToArray(sink)
    expect(actual).toEqual(['A', 'B', 'C'])
  })

  it('uses the shorthand to provide an array of data to consumers', async () => {
    const data = ['A', 'B', 'C']
    const source = spigot(data)
    const sink = new PassThrough()

    source.pipe(sink)
    jest.runAllImmediates()

    const actual = await streamToArray(sink)
    expect(actual).toEqual(data)
  })

  it('stops before the end of the array if null is detectd in array', async () => {
    const data = ['foo', 'bar', null, 'baz']
    const expected = ['foo', 'bar']

    const source = spigot(data)
    const sink = new PassThrough()
    source.pipe(sink)

    jest.runAllImmediates()
    const actual = await streamToArray(sink)
    expect(actual).toEqual(expected)
  })

  it('stops before the end of the array if undefined is detected in array', async () => {
    const data = ['foo', 'bar', undefined, '22', '33']
    const expected = ['foo', 'bar']

    const source = spigot(data)
    const sink = new PassThrough()

    source.pipe(sink)
    jest.runAllImmediates()

    const actual = await streamToArray(sink)
    expect(actual).toEqual(expected)
  })

  it('takes an array of objects and provides it to a consumer', async () => {
    const data = [
      { cats: 'meow', dogs: 'woof' },
      { birds: 'tweet', elephant: 'toot' }
    ]

    const source = spigot(data, { objectMode: true })
    const sink = new PassThrough({ objectMode: true })

    source.pipe(sink)
    jest.runAllImmediates()

    const actual = await objectStreamToArray(sink)
    expect(actual).toEqual(data)
  })
})
