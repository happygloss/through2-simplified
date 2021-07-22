import { describe, expect, it } from '@jest/globals'
import {
  PassThrough,
  Transform,
  TransformCallback,
  TransformOptions
} from 'stream'
import Through2, { ctor, BufferEncoding } from '../src'
import {
  ctorTransform,
  fillString,
  generateData,
  objectStreamToArray,
  streamToArray,
  transform,
  transformObj,
  transformObjWithCustomOptions,
  writeArrayToStream,
  createSourceWithData
} from './helpers'

export interface Temperature {
  value: number
  unit: 'C' | 'F'
}

/**
 * @description Converts temperature records in an object stream from Celsius to Farenheit and vice versa.
 * @param {Through2} this Runs in the context of Through2.
 * @param {Temperature} record A temperature measurement in either Celsius or Farenheit.
 * @param {BufferEncoding} _ unused encoding parameter.
 * @param {TransformCallback} callback Callback invoked when done with the record.
 * @returns {void}
 */
function temperatureConverter(
  this: Through2,
  record: Temperature,
  _: BufferEncoding,
  callback: TransformCallback
): void {
  const { value, unit } = record
  if (unit === 'F') {
    const valueinCelsius = ((value - 32) * 5) / 9
    this.push({
      unit: 'C',
      value: valueinCelsius
    })
  }

  if (unit === 'C') {
    const valueInFarenheit = value * 1.8 + 32
    this.push({
      unit: 'F',
      value: valueInFarenheit
    })
  }
  callback()
}

describe('ctor', () => {
  it('creates a named subclass of Through2', () => {
    const name = 'ThroughRandomBytes'
    const ThroughRandomBytes = ctor(name, transform)
    const stream = new ThroughRandomBytes()

    expect(ThroughRandomBytes.name).toEqual(name)
    expect(stream.constructor.name).toEqual(name)
  })

  it('Plain: creates a subclass of Through2 to be used as a transform stream', async () => {
    const name = 'ThroughRandomBytes'
    const expected = `${fillString('a', 10)}${fillString('b', 5)}${fillString(
      'c',
      10
    )}`

    const ThroughRandomBytes = ctor(name, ctorTransform)

    const stream = new ThroughRandomBytes()
    const sink = new PassThrough()
    stream.pipe(sink)

    writeArrayToStream(generateData(), stream)
    stream.end()

    const actual = await streamToArray(sink)
    expect(actual[0]).toEqual(expected)
  })

  it('Reuse: create multiple streams with the subclass returned by ctor', async () => {
    const name = 'ThroughRandomBytes'
    const expected = `${fillString('a', 10)}${fillString('b', 5)}${fillString(
      'c',
      10
    )}`

    const ThroughRandomBytes = ctor(name, ctorTransform)

    const stream1 = new ThroughRandomBytes()
    const stream2 = new ThroughRandomBytes()
    const sink1 = new PassThrough()
    const sink2 = new PassThrough()

    stream1.pipe(sink1)
    stream2.pipe(sink2)

    writeArrayToStream(generateData(), stream1)
    stream1.end()

    writeArrayToStream(generateData(), stream2)
    stream2.end()

    const [stream2Actual] = await streamToArray(sink1)
    expect(stream2Actual).toEqual(expected)
  })

  it('ObjectMode: creates a Through2 subclass that works in object mode', async () => {
    const name = 'ThroughObjectStream'
    const data = [{ in: 101 }, { in: 202 }, { in: -100 }]
    const expected = [{ out: 102 }, { out: 203 }, { out: -99 }]

    const ThroughObjectStream = ctor(name, transformObj, { objectMode: true })
    const stream = new ThroughObjectStream()

    writeArrayToStream(data, stream)
    stream.end()

    const actual = await objectStreamToArray(stream)
    expect(actual).toEqual(expected)
  })

  it('pipeable: reads data piped from another stream', async () => {
    const name = 'TemperatureConverterStream'
    const TemperatureConverterStream = ctor(name, temperatureConverter, {
      objectMode: true
    })
    const stream = new TemperatureConverterStream()

    const data = [
      { value: -2.2, unit: 'F' },
      { value: -40, unit: 'F' },
      { value: 212, unit: 'F' },
      { value: 22, unit: 'C' }
    ]

    const expected = [
      { value: -19, unit: 'C' },
      { value: -40, unit: 'C' },
      { value: 100, unit: 'C' },
      { value: 71.6, unit: 'F' }
    ]

    const source = createSourceWithData(data, true)
    source.pipe(stream)

    const actual = await objectStreamToArray(stream)
    expect(actual).toEqual(expected)
  })

  it('overrides options provided when creating the constructor', async () => {
    const name = 'ThroughOverrideStream'
    const data = [{ in: 101 }, { in: 202 }, { in: -100 }]
    const expected = [{ out: 102 }, { out: 203 }, { out: -99 }]
    const options: TransformOptions = { objectMode: true }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const ThroughOverrideStream = ctor(name, transformObj) as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const stream = new ThroughOverrideStream(options) as Transform

    writeArrayToStream(data, stream)
    stream.end()

    const actual = await objectStreamToArray(stream)
    expect(actual).toEqual(expected)
  })

  it('Accepts custom options when sub-classing Through2', async () => {
    const name = 'ThroughCustomOptionsStream'
    const data = [{ in: 101 }, { in: 202 }, { in: -100 }]
    const expected = [{ out: 102 }, { out: 203 }, { out: -99 }]

    const ThroughCustomOptionsStream = ctor(
      name,
      transformObjWithCustomOptions,
      {
        objectMode: true,
        peek: true
      }
    )

    const stream = new ThroughCustomOptionsStream()
    writeArrayToStream(data, stream)
    stream.end()

    const actual = await objectStreamToArray(stream)
    expect(actual).toEqual(expected)
  })

  it('overrides to add custom options provided when creating the constructor', async () => {
    const name = 'ThroughCustomOptionsStream'
    const data = [{ in: 101 }, { in: 202 }, { in: -100 }]
    const expected = [{ out: 102 }, { out: 203 }, { out: -99 }]

    const ThroughCustomOptionsStream = ctor(name, transformObjWithCustomOptions)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
      objectMode: true,
      peek: true
    }
    const stream = new ThroughCustomOptionsStream(options)
    writeArrayToStream(data, stream)
    stream.end()

    const actual = await objectStreamToArray(stream)
    expect(actual).toEqual(expected)
  })

  it('Flush: uses the flush implementation if one is provided', (done) => {
    let chunkCalled = false
    const transformWithFlush = function transformWithFlush(
      chunk: Buffer,
      _: BufferEncoding,
      callback: TransformCallback
    ): void {
      expect(chunk.toString()).toEqual('aa')
      chunkCalled = true
      callback()
    }

    const flushWithAssertion = function flushWithAssertion(): void {
      expect(chunkCalled).toEqual(true)
      done()
    }

    const name = 'ThroughWithFlush'
    const ThroughWithFlush = ctor(
      name,
      transformWithFlush,
      {},
      flushWithAssertion
    )

    const stream = new ThroughWithFlush()
    stream.end('aa')
  })
})
