import { ReadableOptions } from 'stream'
import arrayToRead from './array-to-read'
import noop from './noop'
import From2, { FromCallback, FromRead } from './stream-class'

/**
 * @description Provide an array of data and get a Readable Stream that push the items once every tick.
 * @template T
 * @param {T} arr An array of items to be streamed.
 * @param {{ objectMode: string}} options Specify optional objectMode.
 * @returns {From2} A From2 Readable Stream instance.
 */
export function fromArray<T = string>(
  arr: T[],
  { objectMode }: { objectMode: boolean } = { objectMode: false }
): From2 {
  const options: ReadableOptions = {
    objectMode
  }

  if (objectMode) {
    options.highWaterMark = 16
  }

  const read = arrayToRead(arr) as unknown as FromRead
  return new From2(options, read)
}

export function fromFn(
  read: FromRead = noop,
  { objectMode }: { objectMode: boolean } = { objectMode: false }
): From2 {
  const options: ReadableOptions = {
    objectMode
  }

  if (objectMode) {
    options.highWaterMark = 16
  }

  return new From2(options, read)
}

export function fromString(str: string): From2 {
  function readString(size: number, next: FromCallback): void {
    if (str.length <= 0) {
      next(null, null)
      return undefined
    }

    const chunk = str.slice(0, size)
    str = str.slice(size)
    next(null, chunk)
  }

  return fromFn(readString)
}

/**
 * @description Create a From2 stream instance.
 * @template T
 * @param {ReadableOptions | T[]} opts Options.
 * @param {FromRead} [read] read function.
 * @returns {From2} A From2 Readable Stream instance.
 */
export default function from2<T = string>(
  opts: ReadableOptions | T[] | string,
  read: FromRead = noop
): From2 {
  if (typeof opts === 'string') {
    return fromString(opts)
  }

  if (Array.isArray(opts)) {
    return fromArray(opts)
  }

  if (typeof opts !== 'object') {
    return fromFn(opts as FromRead)
  }

  return new From2(opts, read)
}
