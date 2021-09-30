// @ts-nocheck

import { ReadableOptions } from 'stream'
// import noop from './noop'
// import arrayToRead from './array-to-read'
import From2, { FromRead } from './stream-class'
// import { fromArray, fromFn } from './from2'
import obj from './obj'
import from2 from './from2'

// /**
//  * @description Create a From2 stream instance.
//  * @template T
//  * @param {ReadableOptions | T[]} opts Options.
//  * @param {FromRead} [read] read function.
//  * @returns {From2} A From2 Readable Stream instance.
//  */
// export default function from2<T = string>(
//   opts: ReadableOptions | T[],
//   read?: FromRead
// ): From2 {
//   if (typeof opts !== 'object' || Array.isArray(opts)) {
//     read = opts
//     opts = {}
//   }

//   const _from = Array.isArray(read) ? arrayToRead(read) : read ?? noop
//   return new From2(opts, _from)
// }

function ctor(opts: ReadableOptions | FromRead, read?: FromRead): typeof From2 {
  if (typeof opts === 'function') {
    read = opts
    opts = {}
  }

  opts = defaults(opts)

  return class From2Extended extends From2 {
    constructor(options: ReadableOptions = {}, read: FromRead) {
      super({ ...opts, ...options }, read)
    }
  }
}

// export function obj(opts: ReadableOptions | FromRead, read?: FromRead): From2 {
//   if (Array.isArray(opts)) {
//     return fromArray(opts, { objectMode: true })
//   }
//   if (typeof opts === 'function') {
//     // read = opts
//     // opts = {}
//     return fromFn(opts, { objectMode: true })
//   }

//   const options: ReadableOptions = {
//     ...(opts ?? {}),
//     objectMode: true,
//     highWaterMark: 16
//   }

//   return from2(options, read)
// }

export { obj, ctor, From2 }
export default from2

function defaults(opts: ReadableOptions | null): ReadableOptions {
  return opts ?? {}
}
