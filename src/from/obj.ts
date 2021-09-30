import { ReadableOptions } from 'stream'
import { fromArray, fromFn } from './from2'
import noop from './noop'
import From2, { FromRead } from './stream-class'

export default function obj<T = Array<Record<string, string>>>(
  opts: ReadableOptions | FromRead | T[],
  read: FromRead = noop
): From2 {
  if (Array.isArray(opts)) {
    return fromArray(opts, { objectMode: true })
  }
  if (typeof opts === 'function') {
    // read = opts
    // opts = {}
    return fromFn(opts, { objectMode: true })
  }

  const options: ReadableOptions = {
    ...(opts ?? {}),
    objectMode: true,
    highWaterMark: 16
  }

  return new From2(options, read)
}
