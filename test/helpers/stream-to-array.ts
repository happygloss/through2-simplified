import { Duplex, Readable } from 'stream'
import { types } from 'util'

/**
 * @param {Duplex} sink duplex stream to extract the data from.
 * @returns {Promise<string[]>} data retrieved from all the chunk.
 */
export async function bufferStreamToArray(sink: Duplex): Promise<string[]> {
  const arr: string[] = []

  for await (const chunk of sink) {
    if (Buffer.isBuffer(chunk) || types.isUint8Array(chunk)) {
      arr.push(chunk.toString('ascii'))
    } else {
      arr.push(chunk)
    }
  }

  return arr
}

/**
 * @description Read values from an object stream.
 * @param {Duplex} sink a duplex stream in object mode.
 * @returns {Promise<Array<Record<string, any>>>} records extracted from the stream.
 */
export async function objectStreamToArray(
  sink: Duplex
): Promise<Array<Record<string, unknown>>> {
  const arr: Array<Record<string, unknown>> = []

  for await (const obj of sink) {
    arr.push(obj)
  }

  return arr
}

/**
 * @template T
 * @description Write an array of data to a stream.
 * @param {T[]} arr An array of values to be written to a stream.
 * @param {Duplex} stream a duplex stream.
 * @returns {void}
 */
export function writeArrayToStream<T>(arr: T[], stream: Duplex): void {
  for (const value of arr) {
    stream.write(value)
  }
}

/**
 * @description Create a readable stream with the data.
 * @template T
 * @param {T[]} arr Data to be provided by the Readable.
 * @param {boolean} objectMode determines if the stream needs to be in object mode.
 * @returns {Readable} a Readable stream that streams the data and ends.
 */
export function createSourceWithData<T = Record<string, unknown>>(
  arr: T[],
  objectMode = false
): Readable {
  const source = new Readable({
    objectMode
  })
  arr.forEach((record: T) => source.push(record))
  source.push(null)
  return source
}
